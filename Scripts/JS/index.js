
const currency = { style: 'currency', currency: 'USD' };
let current401k = 0, employerMatchAmount = 0, expected401k = 0;
let cash = 0;
let TotalIncome = 0, TotalExpense = 0, TotalAsset = 0, TotalDebt = 0;
let matchEmployer401k = false;
var goodMessages = {}, recommendedActions = {};
var debtsOver10 = [], debtsOver4 = [];



$(document).ready(function () {
    $(function () {
        $("#paycheckInformation_LastPayDate").datepicker();
        $("#birthday").datepicker();
    });

    $("button[name^='del']").on("click", function () {
        var name = $(this).attr("name");
        name = name.substring(3, name.length).toLowerCase();
        $(this).parent('div').remove();
        update(name);
    });

    $("input[name^='radio-']").on("click", function () {
        $(this).button('toggle');
    });

    $('#analyze').on("click", function () {
        updateTotal('asset');
        checkEmergencyFund();
        calcRetirementSavingsRate();
        checkCollegeFund();
        outputMessages();
        // recommendedActions['IRA'] = 'Evaluate the merits of a Roth vs Traditional IRA and max the yearly contribution of $6,000.';

    });

})

$("form").submit(function (event) {
    event.preventDefault();
});

function getDollarAmount(item) {
    var amount = $(item).text();
    return amount.substring(amount.indexOf("$"), amount.length);
}

function updateTotal(item) {

    //ADD ALL INPUTS OF ITEM
    let total = 0;
    $('input[id^=' + item + ']').each(function () {
        if (!$(this).attr('id').startsWith("debtInterest")) {
            if ($(this).val() != "") {
                total += parseFloat($(this).val());
            }
        }
    });

    //UPDATE TEXT
    $('#Total' + item).text(total.toLocaleString('en-US', currency));

    switch (item) {
        case "income":
            TotalIncome = total;
            updateCashflow();
            break;
        case "expense":
            TotalExpense = total;
            updateCashflow();
            break;
        case "asset":
            TotalAsset = total;
            updateNetWorth();
            break;
        case "debt":
            TotalDebt = total;
            updateNetWorth();
            break;
    }

}


function update(item) {

    switch (item) {

        //UPDATE 401k
        case "401k":
            //COUNT NUMBER OF PAYCHECKS REMAINING FOR THE YEAR
            var numPaychecks;
            var payDate = new Date($('#paycheckInformation_LastPayDate').val());
            var EOY = new Date(new Date().getFullYear(), 11, 31);

            //PAY PERIOD IS BI-WEEKLY, CALCULATE BY REMAINDER WEEKS FOR THE YEAR
            if ($('#PayPeriod').val() == 'biweekly') {
                numPaychecks = Math.floor((EOY - payDate) / 1000 / 60 / 60 / 24 / 7 / 2);
            }

            //PAY PERIOD IS SEMI-MONTHLY, CALCULATE BY REMAINDER MONTHS FOR THE YEAR
            else {
                numPaychecks = (12 - (payDate.getMonth() + 1)) * 2;
                if (payDate.getUTCDate() < 15) {
                    numPaychecks += 1;
                }
            }

            //UPDATE TOTAL INCOME
            if (!isNaN(numPaychecks)) {
                $('#paycheckLeft').text("Paychecks left for this year: " + numPaychecks);
            }

            //CALCULATE 401K CONTRIBUTION PERCENTAGE FOR EACH PAYCHECK
            current401k = (parseFloat($('#Current401k').val()) / parseFloat($('#paycheckInformation_GrossAmount').val())) * 100;
            current401k = isNaN(current401k) ? 0 : current401k;
            $('#401kContr').text("Currently contributing " + current401k.toLocaleString('en-US', { maximumFractionDigits: 2 }) + "% per paycheck");

            //CALCULATED EXPECTED TOTAL CONTRIBUTION FOR CURRENT YEAR
            expected401k = parseFloat($('#Current401k').val()) * parseFloat(numPaychecks) + parseFloat($('#YTD401k').val());
            expected401k = isNaN(expected401k) ? 0 : expected401k;
            if (expected401k > 0) {
                $('#expected401k').text("Expected " + payDate.getFullYear() + " contribution: " + expected401k.toLocaleString('en-US', currency));
            }

            if ($('#employerMatchAmount').val() != "") {
                employerMatchAmount = $('#employerMatchAmount').val();
            }
            break;

        //UPDATE INCOMES
        case "income":

            //SET PAYCHECK NET AMOUNT IN INCOME1
            let monthlyPay = 0;
            if ($('#NetAmount').val() > 0) {
                if ($('#PayPeriod').val() == 'biweekly') {
                    monthlyPay = parseFloat(($('#NetAmount').val() * 26) / 12);
                }
                else {
                    monthlyPay = parseFloat($('#NetAmount').val()) * 2;
                }

                $('#income1').val(parseFloat(monthlyPay.toFixed(2)));
            }
            updateTotal(item);
            break;

        case "expense":
            updateTotal(item);
            break;

        case "asset":
            updateTotal(item);
            break;

        //UPDATE DEBT
        case "debt":

            //DISABLE PAY OFF MONTHLY SELECTOR IF DEBT IS NOT CREDIT CARD
            $("select[id^='debtType']").each(function () {
                i = $(this).attr('id').slice(-1);

                if ($(this).val() == 'creditcard') {
                    $('#debtPay' + i).removeAttr('disabled');
                }
                else {
                    $('#debtPay' + i).attr('disabled', 'disabled');
                    $('#debtPay' + i).val('');
                }
            });

            //CHECK INTERESTS
            debtsOver10 = [];
            debtsOver4 = [];
            $("input[id^='debtInterest']").each(function () {
                i = $(this).attr('id').slice(-1);

                if ($(this).val() >= 10) {
                    if ($('#debtType' + i).val() == 'creditcard' && $('#debtPay' + i).val() == "no") {
                        debtsOver10.push(i);
                    }
                    else if ($('#debtType' + i).val() != 'creditcard') {
                        debtsOver10.push(i);
                    }
                }

                if ($('#debtType' + i).val() != 'mortgage' && $(this).val() < 10 && $(this).val() >= 4) {
                    if ($('#debtType' + i).val() == 'creditcard' && $('#debtPay' + i).val() == "no") {
                        debtsOver4.push(i);
                    }
                    else if ($('#debtType' + i).val() != 'creditcard') {
                        debtsOver4.push(i);
                    }
                }

            });

            updateTotal(item);
            break;

        case "employerMatch":
            if ($('#employerMatchYes').is(':checked')) {
                $('#employerMatchQ').removeAttr('hidden');

            }
            else {
                $('#employerMatchAmount').val('');
                $('#employerMatchQ').attr('hidden', 'hidden');
            }
            break;

        case "bigPurchase":
            if ($('#bigPurchaseYes').is(':checked')) {
                $('#bigPurchaseQ').removeAttr('hidden');

            }
            else {
                $('#bigPurchaseAmount').val('');
                $('#bigPurchaseQ').attr('hidden', 'hidden');
            }
            break;

        case "otherRetirement":
            if ($('#otherRetirementYes').is(':checked')) {
                $('#otherRetirementQ').removeAttr('hidden');

            }
            else {
                $('#otherRetirementAmount').val('');
                $('#otherRetirementQ').attr('hidden', 'hidden');
            }
            break;
    }


}

function updateCashflow() {
    //UPDATE SUMMARY
    $("#TotalMonthlyIncome").text(getDollarAmount("#Totalincome"));
    $("#TotalMonthlyExpense").text(getDollarAmount("#Totalexpense"));

    //TOTAL CASHFLOW
    let cashflow = TotalIncome - TotalExpense;
    if (cashflow > 0) {
        $("#TotalMonthlyCashflow").attr({ 'class': 'col-6 text-success' });
    }
    else {
        $("#TotalMonthlyCashflow").attr({ 'class': 'col-6 text-danger' });
    }
    $("#TotalMonthlyCashflow").text(cashflow.toLocaleString('en-US', currency));
}

function updateNetWorth() {
    //SET ASSET VARIABLES
    let taxable = 0, retirement = 0, realestate = 0, other = 0;
    let i = 0;
    cash = 0;

    $("select[id^='assetType']").each(function () {
        i = $(this).attr('id').slice(-1);

        if ($('#asset' + i).val() != "") {
            switch ($(this).val()) {
                case "cash":
                    cash += parseFloat($('#asset' + i).val());
                    break;
                case "taxable":
                    taxable += parseFloat($('#asset' + i).val());
                    break;
                case "retirement":
                    retirement += parseFloat($('#asset' + i).val());
                    break;
                case "realestate":
                    realestate += parseFloat($('#asset' + i).val());
                    break;
                case "other":
                    other += parseFloat($('#asset' + i).val());
                    break;
            }
        }
    });

    $("#TotalCash").text(cash.toLocaleString('en-US', currency));
    $("#TotalTaxable").text(taxable.toLocaleString('en-US', currency));
    $("#TotalRetirement").text(retirement.toLocaleString('en-US', currency));
    $("#TotalRealEstate").text(realestate.toLocaleString('en-US', currency));
    $("#TotalOther").text(other.toLocaleString('en-US', currency));

    //SET DEBT VARIABLES
    let mortgage = 0, creditcard = 0, autoloan = 0, studentloan = 0;
    i = 0;

    $("select[id^='debtType']").each(function () {
        i = $(this).attr('id').slice(-1);

        if ($('#debt' + i).val() != "") {

            switch ($(this).val()) {
                case "mortgage":
                    mortgage += parseFloat($('#debt' + i).val());
                    break;
                case "creditcard":
                    creditcard += parseFloat($('#debt' + i).val());
                    break;
                case "autoloan":
                    autoloan += parseFloat($('#debt' + i).val());
                    break;
                case "studentloan":
                    studentloan += parseFloat($('#debt' + i).val());
                    break;
            }
        }
    });

    $("#TotalMortgage").text(mortgage.toLocaleString('en-US', currency));
    $("#TotalCreditCard").text(creditcard.toLocaleString('en-US', currency));
    $("#TotalAutoLoan").text(autoloan.toLocaleString('en-US', currency));
    $("#TotalStudentLoan").text(studentloan.toLocaleString('en-US', currency));

    //UPDATE SUMMARY
    $("#TotalAsset").text(getDollarAmount("#Totalasset"));
    $("#TotalDebt").text(getDollarAmount("#Totaldebt"));

    //TOTAL NET WORTH
    let networth = TotalAsset - TotalDebt;
    if (networth > 0) {
        $("#TotalNetWorth").attr({ 'class': 'col-6 text-success' });
    }
    else {
        $("#TotalNetWorth").attr({ 'class': 'col-6 text-danger' });
    }
    $("#TotalNetWorth").text(networth.toLocaleString('en-US', currency));
}

function check401k() {

    delete recommendedActions['401k'];
    delete goodMessages['401k'];

    if ($('#employerMatchYes').is(':checked') && $('#employerMatchAmount').val() != "") {
        matchEmployer401k = current401k >= $('#employerMatchAmount').val() ? true : false;
    }

    if (matchEmployer401k) {
        goodMessages['401k'] = `You are contributing at least employer match of ${$('#employerMatchAmount').val()}%. You are currently contributing ${current401k}%.`;
    }
    if (!matchEmployer401k) {
        if ($('#employerMatchYes').is(':checked')) {
            recommendedActions['401k'] = `Contribute the amount needed to get the full employer match. You are currently contributing ${current401k}%. Employer match is ${$('#employerMatchAmount').val()}%.`;
        }
    }

}

function checkEmergencyFund() {

    let bigPurchaseAmount = $('#bigPurchaseAmount').val() == '' ? 0 : parseFloat($('#bigPurchaseAmount').val());
    let eFundEnough = cash > 0 && cash >= (TotalExpense * 3) + bigPurchaseAmount;

    delete recommendedActions['eFund1'];
    delete recommendedActions['eFund2'];
    delete goodMessages['eFund'];

    var addBigPurchaseMsg = bigPurchaseAmount == 0 ? '' : ' with required large purchase amount of ' + bigPurchaseAmount.toLocaleString('en-US', currency);

    if (TotalExpense >= 1000 && cash < TotalExpense) {
        recommendedActions['eFund1'] = `Build your emergency fund to at least 1 month's worth of expenses${addBigPurchaseMsg}. You currently have ${cash.toLocaleString('en-US', currency)}.\nYou should have ${(TotalExpense + bigPurchaseAmount).toLocaleString('en-US', currency)}.`;

    }
    if (TotalExpense < 1000 && cash < 1000) {
        recommendedActions['eFund1'] = `Build your emergency fund to at least $1,000${addBigPurchaseMsg}. You currently have ${cash.toLocaleString('en-US', currency)}.`;
        if (bigPurchaseAmount > 0) {
            recommendedActions['eFund1'] += `\nYou should have at least ${(1000 + bigPurchaseAmount).toLocaleString('en-US', currency)}.`;
        }
    }

    check401k();

    //FIND HIGH INTEREST DEBTS
    payDebts("high");

    if (!eFundEnough) {
        recommendedActions['eFund2'] = `Build your emergency fund to at least 3-6 month's of living expenses${addBigPurchaseMsg}. You currently have ${cash.toLocaleString('en-US', currency)}. You should have at least ${((TotalExpense * 3) + bigPurchaseAmount).toLocaleString('en-US', currency)} in your checking or savings account.`;
    }
    else {
        goodMessages['eFund2'] = `You have a healthy cash amount in your emergency fund! You currently have ${cash.toLocaleString('en-US', currency)}.`;
    }

    //FIND MODERATE INTEREST DEBTS
    payDebts("moderate");

}

function payDebts(highModerate) {
    var debtName;
    var debtAmount;
    var debtInterest;

    switch (highModerate) {
        case "high":
            delete recommendedActions['debts1'];

            debtsOver10.forEach(e => {
                debtName = $('#debtName' + e).val() == "" ? $('#debtName' + e).attr('placeholder') : $('#debtName' + e).val();
                debtAmount = parseFloat($('#debt' + e).val()).toLocaleString('en-US', currency);
                debtInterest = $('#debtInterest' + e).val() + "%";

                if ('debts1' in recommendedActions) {
                    recommendedActions['debts1'] += `<br>${debtName}: ${debtAmount} (${debtInterest})`;
                }
                else {
                    recommendedActions['debts1'] = `Pay off these debts:<br>${debtName}: ${debtAmount} (${debtInterest})`;
                }
            });
            break;

        case "moderate":
            delete recommendedActions['debts2'];

            debtsOver4.forEach(e => {
                debtName = $('#debtName' + e).val() == "" ? $('#debtName' + e).attr('placeholder') : $('#debtName' + e).val();
                debtAmount = parseFloat($('#debt' + e).val()).toLocaleString('en-US', currency);
                debtInterest = $('#debtInterest' + e).val() + "%";

                if ('debts2' in recommendedActions) {
                    recommendedActions['debts2'] += `${debtName}: ${debtAmount} (${debtInterest})<br>`;
                }
                else {
                    recommendedActions['debts2'] = `Pay off these debts:<br>${debtName}: ${debtAmount} (${debtInterest})<br>`;
                }
            });
            break;
    }

}

function calcRetirementSavingsRate() {

    delete recommendedActions['retirement'];
    delete goodMessages['retirement'];

    let yearlyIncome = 0;
    let numPaychecks = $('#PayPeriod').val() == 'biweekly' ? 26 : 24;

    yearlyIncome = parseFloat($('#paycheckInformation_GrossAmount').val()) * numPaychecks;
    IRAamount = $('#otherRetirementAmount').val() == '' ? 0 : parseFloat($('#otherRetirementAmount').val());

    let savingsRate = (expected401k + IRAamount) / yearlyIncome;

    if (savingsRate > .15) {
        goodMessages['retirement'] = `Recommended to save at least 15% (pre-tax) into retirement. You are saving ${(savingsRate * 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}%.`;
    }
    else {
        let amountToMeet15 = (yearlyIncome * .15) - (yearlyIncome * savingsRate);
        //console.log(yearlyIncome, savingsRate);
        recommendedActions['retirement'] = `Increase contribution to a retirement account (401k, IRA, SEP-IRA, etc.). To meet the 15% savings rate, you will need to contribute an additional ${amountToMeet15.toLocaleString('en-US', currency)} for the year.`
    }

}

function checkCollegeFund() {
    console.log('checking for college fund');
    if ($('#collegeFundYes').is(':checked')){
        recommendedActions['collegeFund'] = `Evaluate available savings/investment options, such has 529, and contribute accordingly.`
    }
    else{
        delete recommendedActions['collegeFund'];
    }
}

function outputMessages() {

    if (!('debts1' in recommendedActions) && (matchEmployer401k || $('#employerMatchAmount').val() == '')) {
        delete recommendedActions['eFund1'];
    }

    $('#recommendedActions').text('');
    let i = 1;
    Object.entries(recommendedActions).forEach(([key, value]) => {
        $('#recommendedActions').append(`<b>Step ${i}: </b>`);
        $('#recommendedActions').append(value + '<br />');
        i++;
    });

    $('#goodActions').text('');
    i = 1;
    Object.entries(goodMessages).forEach(([key, value]) => {
        $('#goodActions').append('<i class="bi bi-check2-circle text-success"></i> ');
        $('#goodActions').append(value + '<br />');
        i++;
    });

}

function addFields(item) {

    //GET THE LAST NUMBER OF THE ITEM AND PLUS 1
    let i = 1;
    if ($('input[name*=' + item + ']').length > 0) {
        i += parseInt($('#' + item + 's div:last-child').attr('id').slice(-1));
    }

    switch (item) {
        case "income":
            //ADD INCOME FIELDS
            $('#incomes').append([
                $('<div/>', {
                    "class": "input-group",
                    "id": "div-income" + i
                })
                    .append([
                        $('<input>', {
                            "type": "text",
                            "class": "form-control",
                            "placeholder": "Income " + i
                        }),
                        $('<span/>', {
                            "class": "input-group-text",
                            "html": "$"
                        }),
                        $('<input>', {
                            "type": "number",
                            "class": "form-control",
                            "name": "income" + i,
                            "id": "income" + i,
                            "step": ".01",
                            "placeholder": "0",
                            "onchange": "update('income')"
                        }),
                        $('<button/>', {
                            "type": "button",
                            "class": "btn btn-danger fw-bold text-white",
                            "name": "delIncome" + i,
                            "onclick": "removeFields(delIncome" + i + ")",
                            "html": "-"
                        })
                    ])
            ]);
            break;

        case "expense":
            //ADD EXPENSE FIELDS
            $('#expenses').append([
                $('<div/>', {
                    "class": "input-group",
                    "id": "div-expense" + i
                })
                    .append([
                        $('<input>', {
                            "type": "text",
                            "class": "form-control",
                            "placeholder": "Expense " + i
                        }),
                        $('<span/>', {
                            "class": "input-group-text",
                            "html": "$"
                        }),
                        $('<input>', {
                            "type": "number",
                            "class": "form-control",
                            "name": "expense" + i,
                            "id": "expense" + i,
                            "step": ".01",
                            "placeholder": "0",
                            "onchange": "update('expense')"
                        }),
                        $('<button/>', {
                            "type": "button",
                            "class": "btn btn-danger fw-bold text-white",
                            "name": "delExpense" + i,
                            "id": "delExpense" + i,
                            "onclick": "removeFields(delExpense" + i + ")",
                            "html": "-"
                        })
                    ])
            ]);
            break;

        case "asset":
            //ADD ASSET FIELDS
            $('#assets').append([
                $('<div/>', {
                    "class": "input-group",
                    "id": "div-asset" + i
                })
                    .append([
                        $('<input>', {
                            "type": "text",
                            "class": "form-control",
                            "placeholder": "Asset " + i
                        }),
                        $('<select/>', {
                            "class": "form-select",
                            "id": "assetType" + i,
                            "onchange": "update('asset')"
                        }).append([
                            $('<option/>', {
                                "value": "cash",
                                "html": "Checking/Savings"
                            }),
                            $('<option/>', {
                                "value": "taxable",
                                "html": "Taxable Investments"
                            }),
                            $('<option/>', {
                                "value": "retirement",
                                "html": "Retirement"
                            }),
                            $('<option/>', {
                                "value": "realestate",
                                "html": "Real Estate"
                            }),
                            $('<option/>', {
                                "value": "other",
                                "html": "Other"
                            })
                        ]),
                        $('<span/>', {
                            "class": "input-group-text",
                            "html": "$"
                        }),
                        $('<input>', {
                            "type": "number",
                            "class": "form-control",
                            "name": "asset" + i,
                            "id": "asset" + i,
                            "step": ".01",
                            "placeholder": "0",
                            "onchange": "update('asset')"
                        }),
                        $('<button/>', {
                            "type": "button",
                            "class": "btn btn-danger fw-bold text-white",
                            "name": "delAsset" + i,
                            "id": "delAsset" + i,
                            "onclick": "removeFields(delAsset" + i + ")",
                            "html": "-"
                        })
                    ])
            ]);
            break;

        case "debt":
            //ADD DEBT FIELDS
            $('#debts').append([
                $('<div/>', {
                    "class": "input-group",
                    "id": "div-debt" + i
                })
                    .append([
                        $('<input>', {
                            "type": "text",
                            "class": "form-control",
                            "id": "debtName" + i,
                            "placeholder": "Debt " + i,
                            "onchange": "update('debt')"
                        }),
                        $('<select/>', {
                            "class": "form-select",
                            "id": "debtType" + i,
                            "onchange": "update('debt')"
                        }).append([
                            $('<option/>', {
                                "value": "mortgage",
                                "html": "Mortgage"
                            }),
                            $('<option/>', {
                                "value": "autoloan",
                                "html": "Auto Loan"
                            }),
                            $('<option/>', {
                                "value": "creditcard",
                                "html": "Credit Card"
                            }),
                            $('<option/>', {
                                "value": "studentloan",
                                "html": "Student Loan"
                            })
                        ]),
                        $('<span/>', {
                            "class": "input-group-text",
                            "html": "$"
                        }),
                        $('<input>', {
                            "type": "number",
                            "class": "form-control",
                            "name": "debt" + i,
                            "id": "debt" + i,
                            "step": ".01",
                            "placeholder": "0",
                            "onchange": "update('debt')"
                        }),
                        $('<input>', {
                            "type": "number",
                            "class": "form-control",
                            "name": "debtInterest" + i,
                            "id": "debtInterest" + i,
                            "step": ".01",
                            "placeholder": "0",
                            "style": "text-align:right;",
                            "onchange": "update('debt')"
                        }),
                        $('<span/>', {
                            "class": "input-group-text",
                            "html": "%"
                        }),
                        $('<span/>', {
                            "class": "input-group-text",
                            "html": "Pay Off Monthly"
                        }),
                        $('<select/>', {
                            "class": "form-select",
                            "id": "debtPay" + i,
                            "onchange": "",
                            "disabled": "disabled",
                            "onchange": "update('debt')"
                        }).append([
                            $('<option/>', { "value": "" }),
                            $('<option/>', {
                                "value": "yes",
                                "html": "Yes"
                            }),
                            $('<option/>', {
                                "value": "no",
                                "html": "No"
                            })
                        ]),
                        $('<button/>', {
                            "type": "button",
                            "class": "btn btn-danger fw-bold text-white",
                            "name": "delDebt" + i,
                            "id": "delDebt" + i,
                            "onclick": "removeFields(delDebt" + i + ")",
                            "html": "-"
                        })
                    ])
            ]);
    }

}

function removeFields(item) {
    $(item).parent('div').remove();
    update(name);
}
