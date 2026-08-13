import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const userRoleValues = [
  "user",
  "admin",
  "sous_proved",
  "secretariat",
  "chef_bureau",
  "ops",
  "inspecteur",
  "ecole",
] as const;

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", userRoleValues).default("user").notNull(),
  schoolId: int("schoolId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const offices = mysqlTable("offices", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 180 }).notNull(),
  module: varchar("module", { length: 80 }).notNull(),
});

export const rolePermissions = mysqlTable(
  "rolePermissions",
  {
    id: int("id").autoincrement().primaryKey(),
    role: varchar("role", { length: 64 }).notNull(),
    permissionId: int("permissionId").notNull().references(() => permissions.id),
  },
  table => ({ rolePermissionUnique: unique().on(table.role, table.permissionId) }),
);

export const userOfficeAssignments = mysqlTable("userOfficeAssignments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  officeId: int("officeId").notNull().references(() => offices.id),
  jobTitle: varchar("jobTitle", { length: 160 }),
  employeeNumber: varchar("employeeNumber", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  officialName: varchar("officialName", { length: 220 }).notNull(),
  schoolType: varchar("schoolType", { length: 80 }).notNull(),
  level: varchar("level", { length: 120 }).notNull(),
  directorName: varchar("directorName", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  province: varchar("province", { length: 100 }).default("Sud-Kivu"),
  territory: varchar("territory", { length: 120 }),
  commune: varchar("commune", { length: 120 }),
  quartier: varchar("quartier", { length: 120 }),
  status: varchar("status", { length: 60 }).default("active").notNull(),
  legalStatus: varchar("legalStatus", { length: 100 }),
  decreeNumber: varchar("decreeNumber", { length: 100 }),
  decreeDate: timestamp("decreeDate"),
  studentCount: int("studentCount").default(0).notNull(),
  femaleStudentCount: int("femaleStudentCount").default(0).notNull(),
  maleStudentCount: int("maleStudentCount").default(0).notNull(),
  teacherCount: int("teacherCount").default(0).notNull(),
  notes: text("notes"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const sequences = mysqlTable(
  "sequences",
  {
    id: int("id").autoincrement().primaryKey(),
    namespace: varchar("namespace", { length: 100 }).notNull(),
    year: int("year").notNull(),
    prefix: varchar("prefix", { length: 160 }),
    nextValue: int("nextValue").default(1).notNull(),
    padding: int("padding").default(4).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ sequenceUnique: unique().on(table.namespace, table.year) }),
);

export const dossiers = mysqlTable("dossiers", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 180 }).notNull().unique(),
  subject: varchar("subject", { length: 240 }).notNull(),
  description: text("description"),
  source: varchar("source", { length: 120 }).notNull(),
  sender: varchar("sender", { length: 180 }).notNull(),
  externalReference: varchar("externalReference", { length: 120 }),
  schoolId: int("schoolId").references(() => schools.id),
  currentOfficeId: int("currentOfficeId").references(() => offices.id),
  status: varchar("status", { length: 60 }).default("received").notNull(),
  priority: varchar("priority", { length: 30 }).default("normal").notNull(),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  dueAt: timestamp("dueAt"),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const dossierEvents = mysqlTable("dossierEvents", {
  id: int("id").autoincrement().primaryKey(),
  dossierId: int("dossierId").notNull().references(() => dossiers.id),
  action: varchar("action", { length: 80 }).notNull(),
  fromStatus: varchar("fromStatus", { length: 60 }),
  toStatus: varchar("toStatus", { length: 60 }),
  fromOfficeId: int("fromOfficeId").references(() => offices.id),
  toOfficeId: int("toOfficeId").references(() => offices.id),
  comment: text("comment"),
  actorId: int("actorId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  dossierId: int("dossierId").references(() => dossiers.id),
  schoolId: int("schoolId").references(() => schools.id),
  officeId: int("officeId").references(() => offices.id),
  title: varchar("title", { length: 240 }).notNull(),
  documentType: varchar("documentType", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  reference: varchar("reference", { length: 180 }),
  version: int("version").default(1).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  mimeType: varchar("mimeType", { length: 160 }).notNull(),
  fileSize: int("fileSize"),
  uploadedBy: int("uploadedBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const documentTemplates = mysqlTable("documentTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  documentType: varchar("documentType", { length: 100 }).notNull(),
  body: text("body").notNull(),
  variables: text("variables"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull().references(() => schools.id),
  reportType: varchar("reportType", { length: 100 }).notNull(),
  period: varchar("period", { length: 60 }).notNull(),
  status: varchar("status", { length: 60 }).default("received").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  observations: text("observations"),
  submittedBy: int("submittedBy").notNull().references(() => users.id),
  reviewedBy: int("reviewedBy").references(() => users.id),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: varchar("type", { length: 80 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  entityType: varchar("entityType", { length: 80 }),
  entityId: int("entityId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: int("entityId"),
  beforeData: text("beforeData"),
  afterData: text("afterData"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const schoolStaff = mysqlTable("schoolStaff", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull().references(() => schools.id),
  fullName: varchar("fullName", { length: 180 }).notNull(),
  gender: varchar("gender", { length: 20 }),
  functionTitle: varchar("functionTitle", { length: 160 }).notNull(),
  qualification: varchar("qualification", { length: 120 }),
  employeeNumber: varchar("employeeNumber", { length: 80 }),
  status: varchar("status", { length: 60 }).default("active").notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const schoolStatistics = mysqlTable("schoolStatistics", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull().references(() => schools.id),
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  studentCount: int("studentCount").default(0).notNull(),
  femaleStudentCount: int("femaleStudentCount").default(0).notNull(),
  maleStudentCount: int("maleStudentCount").default(0).notNull(),
  teacherCount: int("teacherCount").default(0).notNull(),
  classroomCount: int("classroomCount").default(0).notNull(),
  status: varchar("status", { length: 40 }).default("draft").notNull(),
  submittedBy: int("submittedBy").notNull().references(() => users.id),
  reviewedBy: int("reviewedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ schoolYearUnique: unique().on(table.schoolId, table.schoolYear) }));

export const schoolBulletins = mysqlTable("schoolBulletins", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  body: text("body").notNull(),
  audience: varchar("audience", { length: 30 }).default("targeted").notNull(),
  documentId: int("documentId").references(() => documents.id),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const schoolBulletinRecipients = mysqlTable("schoolBulletinRecipients", {
  id: int("id").autoincrement().primaryKey(),
  bulletinId: int("bulletinId").notNull().references(() => schoolBulletins.id),
  schoolId: int("schoolId").notNull().references(() => schools.id),
  readAt: timestamp("readAt"),
  acknowledgedAt: timestamp("acknowledgedAt"),
}, table => ({ bulletinSchoolUnique: unique().on(table.bulletinId, table.schoolId) }));

export const assignmentCommissions = mysqlTable("assignmentCommissions", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 180 }).notNull().unique(),
  agentDinacope: varchar("agentDinacope", { length: 80 }).notNull(),
  agentName: varchar("agentName", { length: 180 }).notNull(),
  postName: varchar("postName", { length: 160 }),
  firstName: varchar("firstName", { length: 160 }),
  gender: varchar("gender", { length: 20 }),
  diploma: varchar("diploma", { length: 100 }),
  option: varchar("option", { length: 160 }),
  destinationSchoolId: int("destinationSchoolId").notNull().references(() => schools.id),
  destinationFunction: varchar("destinationFunction", { length: 160 }).notNull(),
  functionGrade: varchar("functionGrade", { length: 80 }),
  actNature: varchar("actNature", { length: 100 }).notNull(),
  actReference: varchar("actReference", { length: 120 }),
  actDate: timestamp("actDate"),
  effectiveDate: timestamp("effectiveDate"),
  replacedAgentDinacope: varchar("replacedAgentDinacope", { length: 80 }),
  reason: varchar("reason", { length: 120 }),
  previousSchoolName: varchar("previousSchoolName", { length: 220 }),
  previousSchoolCode: varchar("previousSchoolCode", { length: 80 }),
  previousFunction: varchar("previousFunction", { length: 160 }),
  previousProvince: varchar("previousProvince", { length: 120 }),
  previousSubDivision: varchar("previousSubDivision", { length: 160 }),
  status: varchar("status", { length: 60 }).default("draft").notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
  signedBy: int("signedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;
export type Dossier = typeof dossiers.$inferSelect;
export type InsertDossier = typeof dossiers.$inferInsert;
export type Office = typeof offices.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
