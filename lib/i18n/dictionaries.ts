export type Locale = "en" | "es" | "fr";

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    "app.name": "CarePulse",
    "nav.dashboard": "Dashboard",
    "nav.appointments": "Appointments",
    "nav.patients": "Patients",
    "nav.doctors": "Doctors",
    "nav.analytics": "Analytics",
    "nav.notifications": "Notifications",
    "nav.audit": "Audit Log",
    "nav.settings": "Settings",
    "nav.jobs": "Background Jobs",
    "status.pending": "Pending",
    "status.scheduled": "Scheduled",
    "status.cancelled": "Cancelled",
    "status.completed": "Completed",
    "status.no_show": "No show",
    "status.rescheduled": "Rescheduled",
    "empty.appointments": "No appointments found",
    "empty.notifications": "You're all caught up",
    "action.schedule": "Schedule",
    "action.cancel": "Cancel",
    "action.export": "Export",
    "action.save": "Save changes",
    "patient.portal": "Patient portal",
    "admin.welcome": "Welcome back",
  },
  es: {
    "app.name": "CarePulse",
    "nav.dashboard": "Panel",
    "nav.appointments": "Citas",
    "nav.patients": "Pacientes",
    "nav.doctors": "Doctores",
    "nav.analytics": "Analítica",
    "nav.notifications": "Notificaciones",
    "nav.audit": "Auditoría",
    "nav.settings": "Configuración",
    "nav.jobs": "Tareas",
    "status.pending": "Pendiente",
    "status.scheduled": "Programada",
    "status.cancelled": "Cancelada",
    "status.completed": "Completada",
    "status.no_show": "No asistió",
    "status.rescheduled": "Reprogramada",
    "empty.appointments": "No se encontraron citas",
    "empty.notifications": "No hay notificaciones",
    "action.schedule": "Programar",
    "action.cancel": "Cancelar",
    "action.export": "Exportar",
    "action.save": "Guardar cambios",
    "patient.portal": "Portal del paciente",
    "admin.welcome": "Bienvenido de nuevo",
  },
  fr: {
    "app.name": "CarePulse",
    "nav.dashboard": "Tableau de bord",
    "nav.appointments": "Rendez-vous",
    "nav.patients": "Patients",
    "nav.doctors": "Médecins",
    "nav.analytics": "Analytique",
    "nav.notifications": "Notifications",
    "nav.audit": "Journal d'audit",
    "nav.settings": "Paramètres",
    "nav.jobs": "Tâches",
    "status.pending": "En attente",
    "status.scheduled": "Planifié",
    "status.cancelled": "Annulé",
    "status.completed": "Terminé",
    "status.no_show": "Absent",
    "status.rescheduled": "Replanifié",
    "empty.appointments": "Aucun rendez-vous",
    "empty.notifications": "Aucune notification",
    "action.schedule": "Planifier",
    "action.cancel": "Annuler",
    "action.export": "Exporter",
    "action.save": "Enregistrer",
    "patient.portal": "Portail patient",
    "admin.welcome": "Bon retour",
  },
};

export function t(
  key: string,
  locale: Locale = "en",
  vars?: Record<string, string | number>
): string {
  const dict = dictionaries[locale] ?? dictionaries.en;
  let value = dict[key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}

export const SUPPORTED_LOCALES: Locale[] = ["en", "es", "fr"];
