import * as yup from "yup"

export const validationSchema = yup.object({
  name: yup
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name must not exceed 100 characters")
    .required("Event name is required"),

  start_date: yup
    .date()
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Start date cannot be in the past")
    .required("Start date is required"),

  end_date: yup
    .date()
    .min(yup.ref("start_date"), "End date must be after start date")
    .required("End date is required"),

  event_address: yup
    .string()
    .min(10, "Event address must be at least 10 characters")
    .required("Event address is required"),

  participation_fee: yup
    .number()
    .typeError("Must be a number")
    .min(0, "Participant fee cannot be negative")
    .nullable()
    .optional(),

  description: yup.string().max(1000, "Description must not exceed 1000 characters"),

  event_flier: yup
    .mixed()
    .nullable()
    .test("fileSize", "File size must not exceed 2MB", function (value) {
      if (!value) return true
      const file = value as File
      return file.size <= 2 * 1024 * 1024
    })
    .test("fileType", "Only image files are allowed", function (value) {
      if (!value) return true
      const file = value as File
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
      return allowedTypes.includes(file.type)
    }),
})
