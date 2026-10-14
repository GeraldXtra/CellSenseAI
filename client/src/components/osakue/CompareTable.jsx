import { phoneName } from "../shared/PhoneImage.jsx";

function formatPrice(price) {
  if (!price || price.current == null) return "";
  const currency = price.currency || "USD";
  return currency === "USD" ? `$${price.current}` : `${price.current} ${currency}`;
}

function unit(value, suffix) {
  return value == null || value === "" ? "" : `${value}${suffix}`;
}

const rows = [
  { key: "price", label: "Price", value: (phone) => formatPrice(phone.price) },
  { key: "processor", label: "Processor", value: (phone) => phone.specs?.processor || "" },
  { key: "ram", label: "RAM", value: (phone) => unit(phone.specs?.ram, " GB") },
  { key: "storage", label: "Storage", value: (phone) => unit(phone.specs?.storage, " GB") },
  { key: "mainCamera", label: "Main camera", value: (phone) => unit(phone.specs?.mainCamera, " MP") },
  { key: "frontCamera", label: "Front camera", value: (phone) => unit(phone.specs?.frontCamera, " MP") },
  { key: "battery", label: "Battery", value: (phone) => unit(phone.specs?.battery, " mAh") },
  { key: "displaySize", label: "Display", value: (phone) => unit(phone.specs?.displaySize, "in") },
  { key: "refreshRate", label: "Refresh rate", value: (phone) => unit(phone.specs?.refreshRate, " Hz") },
  { key: "os", label: "Operating system", value: (phone) => phone.specs?.os || "" },
];

export default function CompareTable({ phones, best = {} }) {
  return (
    <div className="cs-table-wrap">
      <table className="table compare-table">
        <caption className="visually-hidden">Specs of the phones side by side</caption>
        <thead className="visually-hidden">
          <tr>
            <th scope="col">Spec</th>
            {phones.map((phone) => (
              <th key={phone.slug} scope="col">
                {phoneName(phone)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const winners = Array.isArray(best[row.key]) ? best[row.key] : [];
            return (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {phones.map((phone) => {
                  const won = winners.includes(phone.slug);
                  const priceCell = row.key === "price" ? " compare-price" : "";
                  return (
                    <td key={phone.slug} className={won ? `cs-cell-best${priceCell}` : priceCell.trim()}>
                      {row.value(phone)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
