<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Test Report</title>
    <style type="text/css">
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
        .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; }
        .patient-info, .test-info { width: 100%; margin-bottom: 15px; }
        .patient-info td, .test-info td { padding: 4px; }
        table.results { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.results th, table.results td { border: 1px solid black; padding: 6px; text-align: left; font-size: 11px; }
        table.results th { background-color: #f2f2f2; }
        .footer { margin-top: 30px; text-align: right; font-style: italic; font-size: 10px; }
        .section-title { font-weight: bold; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">TEST REPORT</div>
        <div>PathLab Diagnostics Center</div>
        <div>123 Medical Street, Indore</div>
    </div>

    <table class="patient-info">
        <tr>
            <td><b>Patient:</b> ${patient.name}</td>
            <td><b>Age / Gender:</b> ${patient.age} / ${patient.gender}</td>
        </tr>
        <tr>
            <td><b>Booking ID:</b> ${booking.bookingId}</td>
            <td><b>Report Date:</b> ${generatedAt?string("dd-MMM-yyyy HH:mm")}</td>
        </tr>
    </table>

<#list tests as test>
    <div class="section-title">${test.testName}</div>
    <table class="results">
        <thead>
            <tr>
                <th>Parameter</th>
                <th>Observed Value</th>
                <th>Unit</th>
                <th>Reference (Male)</th>
                <th>Reference (Female)</th>
                <th>Reference (Child)</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <#list test.parameters as param>
            <tr>
                <td>${param.name}</td>
                <td>${param.value}</td>
                <td>${param.unit}</td>
                <td>${param.refRangeMale}</td>
                <td>${param.refRangeFemale}</td>
                <td>${param.refRangeChild}</td>
                <td>${param.status}</td>
            </tr>
            </#list>
            <tr>
                <td colspan="7" style="font-style: italic; background-color:#fafafa;">
                    <b>Interpretation:</b> ${test.interpretation!""}
                </td>
            </tr>
        </tbody>
    </table>
</#list>


    <div class="footer">
        Printed On: ${generatedAt?string("dd-MMM-yyyy HH:mm")}
    </div>
</body>
</html>
