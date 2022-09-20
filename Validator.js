

 const DATA_VALIDATIONS = {
    EMAIL : 1,
    NUMERIC_ONLY : 2,
    MIN_LENGTH : 3,
    ALPHABET_ONLY : 4,
    NO_SPECIAL_CHARS : 5,
    ADDRESS : 6,
    NAME : 7,
    MIN_LENGTH_SEARCH : 8,
    NUMERIC_WITH_SPECIAL_CHAR :9
 }

 const validationRegEx = {
     emailRegEx : /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
     onlyAlphaRegEx : /^[a-zA-Z\u0E01-\u0E5B ]+$/,
     noSplCharRegEx : /^[a-zA-Z\u0E01-\u0E5B0-9 ]+$/,
     onlyNumeric : /^[0-9]+$/,
     onlyAlphaWithComma : /^[a-zA-Z\u0E01-\u0E5B.,]+$/,
     alphaNumericWithSlash : /^[a-zA-Z\u0E01-\u0E5B0-9 '.,/-]+$/,
     NumericWithSpecialChar : /^(?=.*?[0-9 ])[0-9 @#$^*()_+=,.?-]+$/  // /^[a-zA-Z_\-]+$/  // /[^a-zA-Z]/g
 };

 const validateInputSize=(validationObj)=> {
   var valRes = false;
   if(validationObj.minChar && validationObj.inputChar){
       if(validationObj.inputChar.trim().length < validationObj.minChar){
           valRes = false;
       }else {
           valRes = true;
       }
   }else{
       valRes = true;
   }
   return valRes;
 }
 

 const validateEmail=(validationObj)=> {
     var validRes = false;
     if(validationObj.inputChar){
         if(validationRegEx.emailRegEx.test(validationObj.inputChar)){
             validRes = true;
         }else {
             validRes = false;
             }
     }else {
            validRes = true;
     }
     return validRes;
 }
 
 
 const validateOnlyAlphabets=(validationObj)=> {
     var validRes = false;
     if(validationObj.inputChar){
         if(validationRegEx.onlyAlphaRegEx.test(validationObj.inputChar)){
             validRes = true;
         }else {
             validRes = false;
             }
     }else {
            validRes = true;
     }
     return validRes;
 }
 

 const validateNoSplCharecters=(validationObj)=> {
     var validRes = false;
     if(validationObj.inputChar){
         if(validationRegEx.noSplCharRegEx.test(validationObj.inputChar)){
             validRes = true;
         }else {
             validRes = false;
             }
     }else {
            validRes = true;
     }
     return validRes;
 }
 
 
 const validateOnlyNumericData=(validationObj)=> {
     var validRes = false;
     if(validationObj.inputChar){
         if(validationRegEx.onlyNumeric.test(validationObj.inputChar)){
             validRes = true;
         }else {
             validRes = false;
             }
     }else {
            validRes = true;
     }
     return validRes;
 }
 

const validateAlphaNumericWithSlash=(validationObj)=> {
     var validRes = false;
     if(validationObj.inputChar){
         if(validationRegEx.alphaNumericWithSlash.test(validationObj.inputChar)){
             validRes = true;
         }else {
             validRes = false;
             }
     }else {
            validRes = true;
     }
     return validRes;
 }
 
const validateAlphaAndSplChars=(validationObj)=> {
     var validRes = false;
     if(validationObj.inputChar){
         if(validationRegEx.onlyAlphaWithComma.test(validationObj.inputChar)){
             validRes = true;
         }else {
             validRes = false;
             }
     }else {
            validRes = true;
     }
     return validRes;
 }

 const toFromDateValidation=(_fromDate,_toDate)=>{
    var _isValid = false;
    if(Number(_fromDate) > Number(_toDate)){
        _isValid = false;
    }
    else{
        _isValid = true;
    }
    return _isValid;
}


const validateNumericWithSpecialChar=(validationObj)=> {
    var validRes = false;
    if(validationObj.inputChar){
        if(validationRegEx.NumericWithSpecialChar.test(validationObj.inputChar)){
            validRes = true;
        }else {
            validRes = false;
            }
    }else {
           validRes = true;
    }
    return validRes;
}


 
 //function to add alert message depending on validation type
 const handleValidationType =(validationType,value,minChar)=> {
     var message = null;
     switch(validationType) {
         case DATA_VALIDATIONS.EMAIL:
         if(validateEmail({inputChar:value})){
             message = L("email_validation");
         }
         break;
         case DATA_VALIDATIONS.NUMERIC_ONLY:
         if(validateOnlyNumericData({inputChar:value})){
             message = L("only_numeric_validation");
         }
         break;
         case DATA_VALIDATIONS.MIN_LENGTH:
         if(validateInputSize({inputChar:value,minChar:minChar})){
             message = L("min_validation");

         }
         break;
         case DATA_VALIDATIONS.ALPHABET_ONLY:
         if(validateOnlyAlphabets({inputChar:value})){
             message = L("only_alphabets_validation");
         }
         break;
         case DATA_VALIDATIONS.NO_SPECIAL_CHARS:
         if(validateNoSplCharecters({inputChar:value})){
             message = L("no_special_validation");
         }
         break;
         case DATA_VALIDATIONS.ADDRESS:
         if(validateAlphaNumericWithSlash({inputChar:value})){
             message = L("address_validation");
         }
         break;
         case DATA_VALIDATIONS.NAME:
         if(validateAlphaAndSplChars({inputChar:value})){
             message = L("name_validation");
         }
         break;
         case DATA_VALIDATIONS.MIN_LENGTH_SEARCH:
         if(validateInputSize({inputChar:value,minChar:minChar,isSearch:true})){
             message = L("min_search_validation");
             message = String.format(L("min_validation"), minChar);
         }
         break;
         case DATA_VALIDATIONS.NUMERIC_WITH_SPECIAL_CHAR:
         if(validateNumericWithSpecialChar({inputChar:value})){
             message = L("NumericWithSpecialChar_validate");
         }
         break;
         
         default:
         printDebugLogForDevelopmentBuild("default case" + validationType);
     }
     return message;
 }
 


 
 
