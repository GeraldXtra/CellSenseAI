import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiChevronRight, FiInfo, FiUpload } from "react-icons/fi";
import { useAsync } from "../../hooks/useAsync.js";
import {
  createPhone,
  getAdminPhone,
  getAdminPhones,
  updatePhone,
  uploadPhonePicture,
} from "../../services/admin.service.js";
import PhoneCard from "../../components/shared/PhoneCard.jsx";
import PhoneImage, { phoneName } from "../../components/shared/PhoneImage.jsx";
import Loader from "../../components/shared/Loader.jsx";
import EmptyState from "../../components/shared/EmptyState.jsx";
import { CATEGORIES, categoryLabel, formatDay, localToday } from "../Admin/adminFormat.js";
import "./AdminPhone.css";

const OTHER_BRAND = "__other__";
const MAX_PICTURE = 2 * 1024 * 1024;
const FALLBACK = "Something went wrong. Try again.";

const MESSAGES = {
  brand: "Enter a brand between 1 and 40 characters",
  model: "Enter a model between 1 and 60 characters",
  category: "Choose a category: budget, midrange, flagship, gaming or camera",
  price: "Enter a guide price between 20 and 5000 US dollars",
  checkedOn: "Enter the date the price was checked",
  future: "The date checked can't be in the future",
  aiSummary: "Keep the summary under 400 characters",
  has5G: "Choose whether the phone has 5G",
  pictureType: "Upload a PNG picture",
  pictureSize: "Keep the picture under 2 MB",
};

const SPEC_FIELDS = [
  { key: "processor", label: "Processor", type: "text", message: "Enter a processor of up to 60 characters" },
  { key: "ram", label: "RAM", unit: "GB", min: 1, max: 32, message: "Enter RAM between 1 and 32 GB" },
  { key: "storage", label: "Storage", unit: "GB", min: 8, max: 2048, message: "Enter storage between 8 and 2048 GB" },
  { key: "mainCamera", label: "Main camera", unit: "MP", min: 2, max: 300, message: "Enter a main camera between 2 and 300 MP" },
  { key: "frontCamera", label: "Front camera", unit: "MP", min: 1, max: 100, message: "Enter a front camera between 1 and 100 MP" },
  { key: "battery", label: "Battery", unit: "mAh", min: 1000, max: 10000, message: "Enter a battery between 1000 and 10000 mAh" },
  { key: "displaySize", label: "Display size", unit: "in", min: 3, max: 9, message: "Enter a display size between 3 and 9 inches" },
  { key: "displayType", label: "Display type", type: "text", message: "Enter a display type of up to 60 characters" },
  { key: "refreshRate", label: "Refresh rate", unit: "Hz", min: 60, max: 240, message: "Enter a refresh rate between 60 and 240 Hz" },
  { key: "os", label: "Operating system", type: "text", message: "Enter an operating system of up to 60 characters" },
];

const FIELD_ORDER = ["brand", "model", "category", "releaseYear"]
  .concat(SPEC_FIELDS.map((field) => field.key))
  .concat(["has5G", "price", "checkedOn", "aiSummary"]);

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nextYear() {
  return new Date().getFullYear() + 1;
}

function yearMessage() {
  return `Enter a release year between 2010 and ${nextYear()}`;
}

function toNumber(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : Number.NaN;
}

function blankForm() {
  const form = {
    brand: "",
    otherBrand: "",
    model: "",
    category: "",
    releaseYear: "",
    has5G: false,
    price: "",
    checkedOn: localToday(),
    aiSummary: "",
  };
  for (const field of SPEC_FIELDS) form[field.key] = "";
  return form;
}

function formFromPhone(phone) {
  const specs = phone.specs || {};
  const form = blankForm();
  form.brand = phone.brand || "";
  form.model = phone.model || "";
  form.category = phone.category || "";
  form.releaseYear = phone.releaseYear != null ? String(phone.releaseYear) : "";
  form.has5G = Boolean(specs.has5G);
  form.price = phone.price && phone.price.current != null ? String(phone.price.current) : "";
  form.checkedOn = (phone.price && phone.price.updatedAt) || "";
  form.aiSummary = phone.aiSummary || "";
  for (const field of SPEC_FIELDS) {
    form[field.key] = specs[field.key] != null ? String(specs[field.key]) : "";
  }
  return form;
}

function brandOf(form) {
  return (form.brand === OTHER_BRAND ? form.otherBrand : form.brand).trim();
}

function canRename(phone) {
  return Boolean(phone) && phone.source !== "seed";
}

function validate(form, editing, renaming = !editing) {
  const errors = {};
  if (renaming) {
    const brand = brandOf(form);
    if (!brand || brand.length > 40) errors.brand = MESSAGES.brand;
    const model = form.model.trim();
    if (!model || model.length > 60) errors.model = MESSAGES.model;
  }
  if (!CATEGORIES.includes(form.category)) errors.category = MESSAGES.category;
  const year = toNumber(form.releaseYear);
  if (!Number.isInteger(year) || year < 2010 || year > nextYear()) {
    errors.releaseYear = yearMessage();
  }
  for (const field of SPEC_FIELDS) {
    if (field.type === "text") {
      if (form[field.key].trim().length > 60) errors[field.key] = field.message;
      continue;
    }
    const number = toNumber(form[field.key]);
    if (number !== null && !(number >= field.min && number <= field.max)) {
      errors[field.key] = field.message;
    }
  }
  if (!editing) {
    const price = toNumber(form.price);
    if (!Number.isInteger(price) || price < 20 || price > 5000) errors.price = MESSAGES.price;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.checkedOn)) errors.checkedOn = MESSAGES.checkedOn;
    else if (form.checkedOn > localToday()) errors.checkedOn = MESSAGES.future;
  }
  if (form.aiSummary.trim().length > 400) errors.aiSummary = MESSAGES.aiSummary;
  return errors;
}

function fieldForMessage(message) {
  if (!message) return "";
  if (message.startsWith("Enter a release year")) return "releaseYear";
  if (message === "That phone is already in the list") return "model";
  if (message === "Enter a brand and a model with letters or digits") return "model";
  if (message === MESSAGES.future) return "checkedOn";
  for (const field of SPEC_FIELDS) {
    if (field.message === message) return field.key;
  }
  for (const key of ["brand", "model", "category", "price", "checkedOn", "aiSummary", "has5G"]) {
    if (MESSAGES[key] === message) return key;
  }
  return "";
}

function specsBody(form) {
  const specs = { has5G: form.has5G };
  for (const field of SPEC_FIELDS) {
    const text = form[field.key].trim();
    if (field.type === "text") specs[field.key] = text || null;
    else specs[field.key] = text ? Number(text) : null;
  }
  return specs;
}

function previewNumber(value) {
  const number = toNumber(value);
  return Number.isFinite(number) ? number : null;
}

function PhoneForm({ slug }) {
  const editing = Boolean(slug);
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        getAdminPhones({ limit: 1 }),
        slug ? getAdminPhone(slug) : Promise.resolve(null),
      ]),
    [slug || ""],
  );
  const [form, setForm] = useState(blankForm);
  const [ready, setReady] = useState(!editing);
  const [errors, setErrors] = useState({});
  const [tried, setTried] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [dragging, setDragging] = useState(false);
  const previewRef = useRef("");

  const phone = data && data[1] ? data[1].phone : null;
  const renaming = !editing || canRename(phone);
  const listed = (data && data[0] && data[0].brands) || [];
  const brands =
    phone && phone.brand && !listed.includes(phone.brand) ? listed.concat(phone.brand) : listed;

  if (editing && !ready && phone) {
    setReady(true);
    setForm(formFromPhone(phone));
  }

  const savedName = phone ? phoneName(phone) : "";

  useEffect(() => {
    const previous = document.title;
    document.title = editing
      ? `Edit ${savedName || "phone"} | CellSense AI`
      : "Add a phone | CellSense AI";
    return () => {
      document.title = previous;
    };
  }, [editing, savedName]);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  function update(key, value) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (tried) setErrors(validate(next, editing, renaming));
    else if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function pickFile(chosen) {
    if (!chosen) return;
    if (chosen.type !== "image/png") {
      setPictureError(MESSAGES.pictureType);
      return;
    }
    if (chosen.size > MAX_PICTURE) {
      setPictureError(MESSAGES.pictureSize);
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(chosen);
    previewRef.current = url;
    setPreviewUrl(url);
    setFile(chosen);
    setPictureError("");
  }

  function clearFile() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = "";
    setPreviewUrl("");
    setFile(null);
    setPictureError("");
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    if (busy) return;
    pickFile(event.dataTransfer.files && event.dataTransfer.files[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setTried(true);
    const found = validate(form, editing, renaming);
    setErrors(found);
    const first = FIELD_ORDER.find((key) => found[key]);
    if (first) {
      const target = document.getElementById(
        first === "brand" && form.brand === OTHER_BRAND ? "admin-otherBrand" : `admin-${first}`,
      );
      if (target) target.focus();
      return;
    }

    setBusy(true);
    setFormError("");
    try {
      const body = {
        category: form.category,
        releaseYear: Number(form.releaseYear),
        specs: specsBody(form),
        aiSummary: form.aiSummary.trim(),
      };
      const name = { brand: brandOf(form), model: form.model.trim() };
      const result = editing
        ? await updatePhone(slug, renaming ? { ...body, ...name } : body)
        : await createPhone({
            ...body,
            ...name,
            price: Number(form.price),
            checkedOn: form.checkedOn,
          });
      const saved = phoneName(result.phone);
      let notice = editing ? `${saved} was saved.` : `${saved} was added.`;
      if (file) {
        try {
          await uploadPhonePicture(result.phone.slug, file);
        } catch (err) {
          notice = `${saved} was saved, but the picture was not: ${err.message || FALLBACK}`;
        }
      }
      navigate("/admin", { state: { notice } });
    } catch (err) {
      const message = err.message || FALLBACK;
      const field = fieldForMessage(message);
      if (field) {
        setErrors({ [field]: message });
        const target = document.getElementById(`admin-${field}`);
        if (target) target.focus();
      } else {
        setFormError(message);
      }
      setBusy(false);
    }
  }

  function fieldProps(key, extra = "") {
    const problem = errors[key];
    return {
      id: `admin-${key}`,
      className: `form-control${extra}${problem ? " is-invalid" : ""}`,
      value: form[key],
      disabled: busy,
      "aria-invalid": Boolean(problem),
      "aria-describedby": problem ? `admin-${key}-error` : undefined,
      onChange: (event) => update(key, event.target.value),
    };
  }

  function renderError(name) {
    if (!errors[name]) return null;
    return (
      <p id={`admin-${name}-error`} className="admin-field-error">
        {errors[name]}
      </p>
    );
  }

  function renderSpec(field) {
    if (field.type === "text") {
      return (
        <div className="admin-field" key={field.key}>
          <label htmlFor={`admin-${field.key}`} className="form-label">
            {field.label}
          </label>
          <input type="text" maxLength={60} {...fieldProps(field.key)} />
          {renderError(field.key)}
        </div>
      );
    }
    return (
      <div className="admin-field" key={field.key}>
        <label htmlFor={`admin-${field.key}`} className="form-label">
          {field.label}
        </label>
        <div className="admin-unit-wrap">
          <input type="text" inputMode="decimal" {...fieldProps(field.key, " admin-unit-input")} />
          <span className="admin-unit" aria-hidden="true">
            {field.unit}
          </span>
        </div>
        {renderError(field.key)}
      </div>
    );
  }

  const brandName = renaming ? brandOf(form) : form.brand;
  const pictureSlug = renaming ? slugify(`${brandName} ${form.model}`) : slug;
  const pictureUrl = previewUrl || (phone && phone.imageUrl) || "";
  const preview = {
    slug: pictureSlug || "new-phone",
    brand: brandName,
    model: form.model.trim() || (brandName ? "" : "New phone"),
    specs: {
      ram: previewNumber(form.ram),
      storage: previewNumber(form.storage),
      mainCamera: previewNumber(form.mainCamera),
      battery: previewNumber(form.battery),
    },
    price: { current: previewNumber(form.price), currency: "USD" },
    imageUrl: pictureUrl,
    source: "admin",
  };
  const summaryLength = form.aiSummary.trim().length;
  const crumb = editing ? savedName || "Edit phone" : "Add a phone";

  function renderBody() {
    if (loading && !data) return <Loader label={editing ? "Loading the phone" : "Loading"} />;
    if (error) {
      return (
        <EmptyState
          title={editing ? "We could not load this phone" : "We could not load the brands"}
          message={error}
          action={
            <div className="admin-phone-actions">
              <button type="button" className="btn btn-outline-primary" onClick={reload}>
                Try again
              </button>
              <Link to="/admin" className="btn btn-primary">
                Back to admin
              </Link>
            </div>
          }
        />
      );
    }
    if (editing && !ready) return <Loader label="Loading the phone" />;

    return (
      <div className="admin-phone-layout">
        <form className="cs-card admin-form" onSubmit={handleSubmit} noValidate>
          {editing && phone && phone.source === "ai" && (
            <p className="cs-notice admin-form-note">
              <FiInfo aria-hidden="true" />
              This phone is marked Estimated. Saving it confirms the specs, and the Estimated label
              goes away.
            </p>
          )}

          <fieldset className="admin-fieldset" disabled={busy}>
            <legend className="admin-legend">Basics</legend>
            <div className="admin-grid admin-grid-4">
              <div className="admin-field">
                <label htmlFor="admin-brand" className="form-label">
                  Brand
                </label>
                {!renaming ? (
                  <input
                    id="admin-brand"
                    type="text"
                    className="form-control admin-readonly"
                    value={form.brand}
                    readOnly
                    aria-readonly="true"
                  />
                ) : (
                  <select
                    {...fieldProps("brand")}
                    className={`form-select${errors.brand && form.brand !== OTHER_BRAND ? " is-invalid" : ""}`}
                    aria-invalid={Boolean(errors.brand && form.brand !== OTHER_BRAND)}
                  >
                    <option value="">Choose a brand</option>
                    {brands.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    <option value={OTHER_BRAND}>Another brand</option>
                  </select>
                )}
                {renaming && form.brand === OTHER_BRAND && (
                  <>
                    <label htmlFor="admin-otherBrand" className="visually-hidden">
                      New brand
                    </label>
                    <input
                      type="text"
                      maxLength={40}
                      placeholder="Brand name"
                      {...fieldProps("otherBrand", " admin-other-brand")}
                      className={`form-control admin-other-brand${errors.brand ? " is-invalid" : ""}`}
                      aria-invalid={Boolean(errors.brand)}
                      aria-describedby={errors.brand ? "admin-brand-error" : undefined}
                    />
                  </>
                )}
                {renderError("brand")}
              </div>

              <div className="admin-field">
                <label htmlFor="admin-model" className="form-label">
                  Model
                </label>
                {!renaming ? (
                  <input
                    id="admin-model"
                    type="text"
                    className="form-control admin-readonly"
                    value={form.model}
                    readOnly
                    aria-readonly="true"
                  />
                ) : (
                  <input type="text" maxLength={60} {...fieldProps("model")} />
                )}
                {renderError("model")}
              </div>

              <div className="admin-field">
                <label htmlFor="admin-category" className="form-label">
                  Category
                </label>
                <select
                  {...fieldProps("category")}
                  className={`form-select${errors.category ? " is-invalid" : ""}`}
                >
                  <option value="">Choose a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabel(category)}
                    </option>
                  ))}
                </select>
                {renderError("category")}
              </div>

              <div className="admin-field">
                <label htmlFor="admin-releaseYear" className="form-label">
                  Release year
                </label>
                <input type="text" inputMode="numeric" maxLength={4} {...fieldProps("releaseYear")} />
                {renderError("releaseYear")}
              </div>
            </div>
            {editing && !renaming && (
              <p className="form-text admin-help">
                The brand and model name the phone's address and picture, so they can't be changed.
              </p>
            )}
            {editing && renaming && (
              <p className="form-text admin-help">
                Changing the brand or model also changes the phone's address and picture name.
              </p>
            )}
          </fieldset>

          <fieldset className="admin-fieldset" disabled={busy}>
            <legend className="admin-legend">Specs</legend>
            <div className="admin-grid admin-grid-3">
              {SPEC_FIELDS.map(renderSpec)}
              <div className="admin-field admin-check-field">
                <label className="admin-check" htmlFor="admin-has5G">
                  <input
                    id="admin-has5G"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.has5G}
                    onChange={(event) => update("has5G", event.target.checked)}
                  />
                  5G
                </label>
                {renderError("has5G")}
              </div>
            </div>
          </fieldset>

          <fieldset className="admin-fieldset" disabled={busy}>
            <legend className="admin-legend">Price</legend>
            <div className="admin-grid admin-grid-2">
              <div className="admin-field">
                <label htmlFor="admin-price" className="form-label">
                  Guide price
                </label>
                <div className="admin-unit-wrap">
                  <span className="admin-prefix" aria-hidden="true">
                    $
                  </span>
                  {editing ? (
                    <input
                      id="admin-price"
                      type="text"
                      className="form-control admin-prefix-input admin-readonly"
                      value={form.price}
                      readOnly
                      aria-readonly="true"
                    />
                  ) : (
                    <input
                      type="text"
                      inputMode="numeric"
                      {...fieldProps("price", " admin-prefix-input")}
                    />
                  )}
                </div>
                {renderError("price")}
              </div>
              <div className="admin-field">
                <label htmlFor="admin-checkedOn" className="form-label">
                  Checked on
                </label>
                {editing ? (
                  <input
                    id="admin-checkedOn"
                    type="text"
                    className="form-control admin-readonly"
                    value={formatDay(form.checkedOn)}
                    readOnly
                    aria-readonly="true"
                  />
                ) : (
                  <input type="date" max={localToday()} {...fieldProps("checkedOn")} />
                )}
                {renderError("checkedOn")}
              </div>
            </div>
            {editing && (
              <p className="form-text admin-help">
                Every price is kept in the history.{" "}
                <Link to="/admin/prices" className="admin-inline-link">
                  Change prices on the Record prices page
                </Link>
                .
              </p>
            )}
          </fieldset>

          <fieldset className="admin-fieldset" disabled={busy}>
            <legend className="admin-legend">
              Summary <span className="admin-optional">(optional)</span>
            </legend>
            <label htmlFor="admin-aiSummary" className="visually-hidden">
              Summary
            </label>
            <textarea
              rows={3}
              placeholder="One or two sentences about who the phone suits."
              {...fieldProps("aiSummary")}
            />
            <p className="form-text admin-help">{summaryLength} of 400 characters</p>
            {renderError("aiSummary")}
          </fieldset>

          {formError && (
            <p className="admin-form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="admin-phone-actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Saving" : "Save phone"}
            </button>
            <Link to="/admin" className="btn btn-outline-primary">
              Cancel
            </Link>
          </div>
        </form>

        <div className="admin-side">
          <section className="cs-card" aria-labelledby="admin-picture-title">
            <h2 id="admin-picture-title" className="admin-side-title">
              Picture
            </h2>
            <div
              className={dragging ? "admin-drop admin-drop-active" : "admin-drop"}
              onDragOver={(event) => {
                event.preventDefault();
                if (!busy) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {pictureUrl ? (
                <div className="admin-drop-picture">
                  <PhoneImage phone={{ brand: brandName, model: form.model, imageUrl: pictureUrl }} />
                </div>
              ) : (
                <FiUpload className="admin-drop-icon" aria-hidden="true" />
              )}
              <p className="admin-drop-text">
                Drop a PNG here or{" "}
                <label htmlFor="admin-picture" className="admin-drop-choose">
                  choose a file
                </label>
              </p>
              <input
                id="admin-picture"
                type="file"
                accept="image/png"
                className="visually-hidden"
                disabled={busy}
                aria-describedby={pictureError ? "admin-picture-error" : "admin-picture-help"}
                onChange={(event) => {
                  pickFile(event.target.files && event.target.files[0]);
                  event.target.value = "";
                }}
              />
            </div>
            {pictureError && (
              <p id="admin-picture-error" className="admin-field-error" role="alert">
                {pictureError}
              </p>
            )}
            <p id="admin-picture-help" className="form-text admin-help">
              PNG only, under 2 MB.
              {pictureSlug ? ` Saved as ${pictureSlug}.png` : ""}
              {file ? " after you save the phone." : ""}
            </p>
            {file && (
              <button type="button" className="btn btn-outline-primary admin-small" onClick={clearFile} disabled={busy}>
                Remove this picture
              </button>
            )}
          </section>

          <section className="cs-card" aria-labelledby="admin-preview-title">
            <h2 id="admin-preview-title" className="admin-side-title">
              How it will look on the site
            </h2>
            <div className="admin-preview" inert>
              <PhoneCard phone={preview} />
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="cs-section admin-phone-intro">
        <div className="cs-container">
          <nav className="admin-crumbs" aria-label="Breadcrumb">
            <Link to="/admin">Admin</Link>
            <FiChevronRight aria-hidden="true" />
            <span aria-current="page">{crumb}</span>
          </nav>
          <h1 className="cs-heading">{editing ? savedName || "Edit phone" : "Add a phone"}</h1>
          <p className="cs-subheading">
            Fill in the specs as the maker lists them. Prices are guide prices in US dollars.
          </p>
        </div>
      </section>

      <section className="cs-section cs-section-alt admin-phone-band">
        <div className="cs-container">{renderBody()}</div>
      </section>
    </>
  );
}

export default function AdminPhone() {
  const { slug } = useParams();
  return <PhoneForm key={slug || "new"} slug={slug} />;
}
