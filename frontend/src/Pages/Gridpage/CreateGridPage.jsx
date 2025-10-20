import { useNavigate } from "react-router"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { ArrowLeft, Check } from "lucide-react"
import axiosInstance from "../../lib/axiosInstance"
import { useState } from "react"
import "./CreateGridPage.css"

const CreateGridPage = () => {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState(null)

  const validate = values => {
    const errors = {}
    if (!values.title.trim()) errors.title = "Grid title is required"
    if (values.statements.filter(s => s.trim() !== "").length < 5)
      errors.statements = "Please fill in all 5 statements"
    if (values.truthIndex === null || values.truthIndex === undefined)
      errors.truthIndex = "Select one true statement"
    return errors
  }

  return (
    <div className="container">

      <main className="create-grid-main">
        <div className="create-grid-header">
          <button
            type="button"
            className="back-link"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>
        </div>

        <div className="create-grid-content">
          <div className="create-grid-title-section">
            <h1>Create a New Bluff Grid</h1>
            <p className="subtitle">
              Create a grid with 4 false statements and 1 true statement about
              yourself
            </p>
          </div>

          <Formik
            initialValues={{
              title: "",
              statements: Array(5).fill(""),
              truthIndex: null
            }}
            validate={validate}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setSubmitError(null)
              console.log('Submitting grid with values:', values)
              try {
                const response = await axiosInstance.post("/save-grid", values)
                console.log('Grid saved successfully:', response.data)
                resetForm()
                navigate("/profile")
              } catch (err) {
                console.error('Error saving grid:', err)
                console.error('Error response:', err.response?.data)
                setSubmitError(
                  err?.response?.data?.message || "Could not save grid"
                )
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting, errors, touched }) => (
              <Form>
                <div className="grid-title-section">
                  <label htmlFor="title" className="form-label">
                    Grid Title
                  </label>
                  <Field
                    id="title"
                    name="title"
                    placeholder="e.g., My Childhood, Travel Adventures"
                    className="grid-title-input"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="statements-section">
                  <h2 className="statements-title">Statements</h2>
                  <p className="statements-subtitle">
                    Enter 5 statements about yourself. Select ONE statement that
                    is true, the rest should be false.
                  </p>

                  {errors.statements && touched.statements && (
                    <div className="error-message">{errors.statements}</div>
                  )}
                  {errors.truthIndex && touched.truthIndex && (
                    <div className="error-message">{errors.truthIndex}</div>
                  )}

                  <div className="statements-grid">
                    {values.statements.map((_, index) => (
                      <div key={index} className="statement-item">
                        <Field
                          as="textarea"
                          name={`statements[${index}]`}
                          placeholder={`Statement ${index + 1}`}
                          rows={2}
                          className="statement-input"
                        />

                        <button
                          type="button"
                          className={`mark-truth-btn ${
                            values.truthIndex === index ? "active" : ""
                          }`}
                          onClick={() => setFieldValue("truthIndex", index)}
                        >
                          <Check size={16} /> Mark Truth
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {submitError && <p className="error-message">{submitError}</p>}

                <div className="create-grid-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate("/profile")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving…" : "Save Grid"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  )
}

export default CreateGridPage
