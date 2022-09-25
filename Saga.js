/* eslint-disable no-empty */
import NetInfo from '@react-native-community/netinfo';
import { call, put, takeEvery, select } from 'redux-saga/effects';

import { API_TYPE, SYNC_STATUS, MAX_RETRY_FOR_API_CALL } from '../../constants/Config';
import { makeHttpCall } from '../../network/PathwayHttpClient';
import { FetchAllUnprocessedApi, UpdateSyncStatusById, UpdateSyncStatusRetryCountById, DeleteById } from '../../database/SqliteDatabaseService';
import { LOG } from '../../logger/LogService';
import { setReqRespForDebug } from '../../logger/LogHelper';
import { setBgApiProcessFlag, setCanMoveToDashBoard } from '../actionCreators/BgApiProcessActionCreators';
import { PROCESS_API_QUEUE } from '../actions/BgApiProcessActions';
let repName = '';

//worker saga
function* processApiQueue() {
	try {
		const appData = yield select();
		repName = appData.appState.appData.rep.name;
		const { isBackgroundApiProcessing, isSyncButtonClicked } = appData.bgApiProcessState; //flag to check if any previous background processing is done or not
		if (!isBackgroundApiProcessing) {
			//Check internet connectivity , userSession and user logged in
			const result = yield call(canProcessQueue, appData);
			const failedItems = [];
			if (result) {
				//select all api where synsStatus is not sycned , failed and retry count is less then = 5
				const apiToProcess = yield call(FetchAllUnprocessedApi, isSyncButtonClicked);
				if (apiToProcess.length > 0) {
					//update store that background API processing is started
					yield put(setBgApiProcessFlag(true));

					let sessionTimeOueFlag = false; // This is needed to break the loop for sessiontimeout
					let failedItem = null; //This is needed to update the item as non processed
					for (var item of apiToProcess) {
						if (item) {
							//update status to processing
							yield call(UpdateSyncStatusById, { syncStatus: SYNC_STATUS.PROCESSING, requestId: item.requestId });
							const apiCallData = {
								item: item,
								success: (item) => {
									//success callback
									apiCallSuccessHandler(item);
								},
								failure: (item, isSessionTimeOut, isTimeout, response) => {
									//failure callback
									failedItems.push({
										dbRow: item,
										isSessionTimeOut: isSessionTimeOut,
										isTimeout: isTimeout,
										response: response
									});
									apiCallFailureHandler(item, isSessionTimeOut, isTimeout, response);
									if (isSessionTimeOut || isTimeout) {
										sessionTimeOueFlag = true;
										failedItem = item;
									}
								}
							};
							if (sessionTimeOueFlag) {
								//update status to processing
								if (failedItem) {
									yield call(UpdateSyncStatusById, { syncStatus: SYNC_STATUS.NOT_SYNCED, requestId: failedItem.requestId });
								}
								break;
							}
							const appData = yield select();
							const result = yield call(canProcessQueue, appData);
							if (result) {
								yield call(makeApiCall, apiCallData);
							} else {
								break;
							}
						}
					}
				}
			}
			if (isSyncButtonClicked) {
				yield call(logErrorViaSaga, failedItems);
				yield put(setCanMoveToDashBoard(true));
			}
			yield put(setBgApiProcessFlag(false));
		}
	} catch (error) {
		const log = LOG.extend('BACKGROUNDAPISAGA');
		log.error(`Background API: processApiQueue: Exception occured `, setReqRespForDebug('Exception occured', null, error.toString(), repName, null));
	}
}

function* makeApiCall(apiCallData) {
	const { item, success, failure } = apiCallData;
	const apiData = item;
	const { METHOD, API } = API_TYPE[apiData.type];
	const { data } = apiData;

	let response = null;

	if (METHOD === 'GET') {
		response = yield call(makeHttpCall, { endpoint: `${API}`, method: METHOD });
	} else if (METHOD === 'POST') {
		response = yield call(makeHttpCall, { endpoint: `${API}`, method: METHOD, body: data });
	}

	const { isSuccess, isSessionTimeOut, isTimeout } = response;
	if (isSessionTimeOut || isTimeout) {
		const log = LOG.extend('BACKGROUNDAPISAGA');
		log.error(`Backgroun API: ${METHOD} Request Failed`, setReqRespForDebug(API, null, response.data, repName, null));
	}

	isSuccess ? success(item) : failure(item, isSessionTimeOut, isTimeout, response);
}

const apiCallSuccessHandler = (item) => {
	//success callback
	DeleteById(item.requestId);
};

const apiCallFailureHandler = (item, isSessionTimeOut, isTimeout, response) => {
	//failure callback
	//const { isSyncButtonClicked } = store.getState().bgApiProcessState;
	const log = LOG.extend('BACKGROUNDAPISAGA');
	log.error(`Background API: apiCallFailureHandler  Failed`, setReqRespForDebug('BACKGROUNDAPISAGA', item, response, repName, null));
	if (isSessionTimeOut || isTimeout) {
		return;
	} else {
		const retryCount = parseInt(item.retryCount);
		if (retryCount + 1 > MAX_RETRY_FOR_API_CALL) {
			//isSyncButtonClicked && DeleteById(item.requestId);
		} else {
			//API call is failed update the status and increment retryCount
			UpdateSyncStatusRetryCountById({ syncStatus: SYNC_STATUS.SYNCED_FAILED, retryCount: retryCount + 1, requestId: item.requestId });
		}
	}
};

const logErrorViaSaga = async (failedItems) => {
	const log = LOG.extend('BACKGROUNDAPISAGA');
	log.error(`Background API: Manul Sync Request Failed`, setReqRespForDebug('Manul Sync Request Failed', null, failedItems, repName, null));
};

//Function to check if queue can be processed
const canProcessQueue = async (storeData) => {
	let netInfo = await NetInfo.fetch();
	const { isSessionTimeOut, isLoggedIn } = storeData.appState.appData;
	return netInfo.isInternetReachable && !isSessionTimeOut && isLoggedIn;
};

//watcher saga
export function* watchBackGroundApiProcessing() {
	yield takeEvery(PROCESS_API_QUEUE, processApiQueue);
}
