function withUnit(value, unit) {
  return value == null || value === "" ? "Not listed" : `${value} ${unit}`;
}

function text(value) {
  return value == null || value === "" ? "Not listed" : value;
}

function display(specs) {
  const size = specs.displaySize != null ? `${specs.displaySize}in` : "";
  const value = [size, specs.displayType].filter(Boolean).join(" ");
  return value || "Not listed";
}

function SpecColumn({ rows }) {
  return (
    <table className="table spec-table">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SpecTable({ specs = {} }) {
  const left = [
    { label: "Processor", value: text(specs.processor) },
    { label: "RAM", value: withUnit(specs.ram, "GB") },
    { label: "Storage", value: withUnit(specs.storage, "GB") },
    { label: "Main camera", value: withUnit(specs.mainCamera, "MP") },
    { label: "Front camera", value: withUnit(specs.frontCamera, "MP") },
  ];
  const right = [
    { label: "Battery", value: withUnit(specs.battery, "mAh") },
    { label: "Display", value: display(specs) },
    { label: "Refresh rate", value: withUnit(specs.refreshRate, "Hz") },
    { label: "Operating system", value: text(specs.os) },
    { label: "5G", value: specs.has5G ? "Yes" : "No" },
  ];

  return (
    <div className="spec-grid">
      <SpecColumn rows={left} />
      <SpecColumn rows={right} />
    </div>
  );
}
