<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Payment Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
        .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; }
        .info-table { width: 100%; margin-bottom: 20px; }
        .info-table td { padding: 6px; }
        .amount-table { width: 100%; border-collapse: collapse; }
        .amount-table th, .amount-table td { border: 1px solid black; padding: 8px; text-align: left; }
        .amount-table th { background-color: #f2f2f2; }
        .footer { margin-top: 30px; text-align: right; font-style: italic; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">PAYMENT RECEIPT</div>
        <div>PathLab Diagnostics Center</div>
        <div>123 Medical Street, Indore</div>
    </div>

    <table class="info-table">
        <tr>
            <td><b>Receipt No:</b> ${payment.id}</td>
            <td><b>Date:</b>${payment.paidAt!"Not Paid"}</td>
        </tr>
        <tr>
            <td><b>Patient:</b> ${patient.name}</td>
            <td><b>Booking ID:</b> ${booking.id}</td>
        </tr>
        <tr>
            <td><b>Email:</b> ${patient.email}</td>
            <td><b>Contact:</b> ${patient.contactNumber!""}</td>
        </tr>
    </table>

    <table class="amount-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Status</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lab Test Booking #${booking.id}</td>
                <td>${payment.status}</td>
                <td>${payment.amount}</td>
            </tr>
            <tr>
                <td colspan="2" style="text-align: right;"><b>Total:</b></td>
                <td><b>${payment.amount}</b></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Printed On: ${generatedAt?string("dd-MMM-yyyy HH:mm")}
    </div>
</body>
</html>
