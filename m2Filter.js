// function formatMoney(n, c, d, t) {
//     var c = isNaN(c = Math.abs(c)) ? 2 : c,
//         d = d == undefined ? "." : d,
//         t = t == undefined ? "," : t,
//         s = n < 0 ? "-" : "",
//         i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
//         j = (j = i.length) > 3 ? j % 3 : 0;

//     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
// };

var priParameter = 'priceperm2=';
var budField = '.budCalcField';
var areField = '.areCalcField';
var meaField = '.meaCalcField';
var calcId = '#m2Filter';
var curFilter = '.currentWrapper';
var txtBeforeResult = 'Base on your budget and area we identify that you can spent maximum:';
var txtAfterResult = 'We already giltered the current list by price per m²/ft² to you.';

function convertMeasure(val, m1, m2) {

    // set convertion number
    var cvM2Ft2 = 10.764;

    // verify which conversion needs to do
    if (m1 === 'm2' && m2 === 'ft2') {
        return val * cvM2Ft2; // return converted value
    } else if (m1 === 'ft2' && m2 === 'm2') {
        return val / cvM2Ft2; // return converted value
    }

}

function calcAndFilter(budget, area, measure) {

    // clean URL to prevent double or more priceperm2 filter on URL
    var cleanedURL = window.location.href.split(priParameter)[0];
    var paraInUrl = window.location.href.split('?');

    // convert area to m2
    if (measure === 'ft2') {
        area = convertMeasure(area, 'ft2', 'm2');
    }
    // make the max price per m2 to filter the results
    var pricePerMeasure = Math.ceil(Number(budget / area));

    // store values on session data
    localStorage['budget'] = budget;
    localStorage['area'] = area;
    localStorage['measure'] = measure;
    localStorage['pricePerMeasure'] = pricePerMeasure;
    // store position to keep it after reload
    localStorage["posStorage"] = jQuery(curFilter).offset().top;

    // build new url to make the filter
    if (paraInUrl.length > 1) {
        // when already have parameters at the url
        var filterURL = cleanedURL + priParameter + '1-' + pricePerMeasure;
    } else {
        // when DON'T have parameters at the url
        var filterURL = cleanedURL + '?' + priParameter + '1-' + pricePerMeasure;
    }

    // reload page with filtered results
    window.location.href = filterURL;

}

function checkEmpty(budget, area, measure) {
    
    // verify if is empty
    if (budget < 1 || area < 1) {
                
        // clean old warnings
        jQuery('.erroSubmitForm').remove();
        jQuery(budField).parent().css('border', '1px solid #ccc');
        jQuery(budField).parent().css('color', '#666');
        jQuery(areField).parent().css('border', '1px solid #ccc');
        jQuery(areField).parent().css('color', '#666');

        // make the new warning
        // for all
        jQuery(calcId).prepend('<p class="erroSubmitForm">Please complete the fields.</p>');
        jQuery('.erroSubmitForm').css('color', 'red');
        // just on budget
        if (budget < 1) {
            jQuery(budField).parent().css('border', '1px solid red');
            jQuery(budField).parent().css('color', 'red');
        }
        // just on area
        if (area < 1) {
            jQuery(areField).parent().css('border', '1px solid red');
            jQuery(areField).parent().css('color', 'red');
        }

    } else {

        // filter results
        calcAndFilter(budget, area, measure);

    }

}

function inputOldValues(budField, areField, meaField) {

    // get values from URL parameters
    var oldBudget = localStorage['budget'];
    var oldArea = localStorage['area'];
    var oldMeasure = localStorage['measure'];

    // convert ft2 to m2 when already have filter and this filter is in ft2 because cames as m2 on URL
    if (oldMeasure === 'ft2') {
        oldArea = Math.ceil(convertMeasure(oldArea, 'm2', 'ft2'));
    }

    // insert values
    jQuery(budField).val(oldBudget);
    jQuery(areField).val(oldArea);
    jQuery(meaField + ' option[value=' + oldMeasure + ']').attr('selected', 'selected');

}

function lastCalculation(calcURL, calcData, pagePosition) {

    // if calculator was used, keep the values on the form
    if (calcURL) {
        if (calcData) {

            // get the current filter height
            var curFilterHeigh = jQuery('.currentWrapper').outerHeight(true);
            // scroll screen to show current filter and form on top
            if (pagePosition) {
                jQuery(window).scrollTop(pagePosition - curFilterHeigh);
                // clean the local storage after use it
                localStorage["posStorage"] = '';
            }

            // auto fill the fields with current values
            inputOldValues(budField, areField, meaField);

            // show results
            var mea = localStorage['measure'].slice(0, -1);
            // insert highlighted text
            jQuery(calcId).append('<div class="resCalcFilter"><p class="resCalcFilter-firstmsg">' + txtBeforeResult + '</p><p class="resCalcFilter-result">£' + localStorage['pricePerMeasure'] + ' per ' + mea + '²</p></div>');
        }
    }
}

jQuery(document).ready(function () {

    var calcURL = window.location.href.split(priParameter)[1];
    var calcData = localStorage['budget'];
    var pagePosition = localStorage["posStorage"];

    // verify if the current calculator filter and make some actions
    lastCalculation(calcURL, calcData, pagePosition);

    jQuery(calcId).on('submit', function (e) {
        
        // stop submit
        e.preventDefault();
        // get values on input and select
        var budget = jQuery(budField).val();
        var area = jQuery(areField).val();
        var measure = jQuery(meaField).find(':selected').val();

        checkEmpty(budget, area, measure);

    });

});