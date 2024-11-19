const API_KEY = "bVxeOiYSUiBNStRHsov2HK7S9yOvwDCE";

$.ajax({
  url: `http://localhost:8080/api/exchange/symbols?apikey=${API_KEY}`,
  datatype: "json",
  success: (data) => updateSymbols(data.symbols),
});

function updateSymbols(symbols) {
  const selector = $("#target_currency");
  selector.empty();

  for (key of Object.keys(symbols)) {
    const symbol = symbols[key];

    const optionEl = document.createElement("option");
    $(optionEl).val(key).text(`${key} (${symbol})`);

    if (key === "GBP") $(optionEl).attr("selected", true);

    selector.append(optionEl);
  }
}

function convert() {
  const currency_to = $("#target_currency").val();
  const currency_from = "USD";
  const currency_amount = $("#usd_amount").val();
  const date = $("#date").val()
    ? new Date($("#date").val()).toISOString().split("T")[0]
    : null;

  if (Number(currency_amount) <= 0)
    return alert("You have not entered a valid amount!");
  if (date === null || new Date($("#date").val()) > new Date())
    return alert("You have not entered a valid date!");

  $.ajax({
    url: `http://localhost:8080/api/exchange/convert?to=${currency_to}&from=${currency_from}&amount=${currency_amount}&date=${date}&apikey=${API_KEY}`,
    datatype: "json",
    success: (data) => updateResults(data),
  });
}

function updateResults(data) {
  const par = document.createElement("p");

  $(par).text(
    `The equivalent of ${formatAmount(data.query.amount, data.query.from)} in ${
      data.query.to
    } for the date ${data.date} is: ${formatAmount(data.result, data.query.to)}`
  );
  $("#output").append(par);
}

function formatAmount(amount, currency) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currency,
  });
}
