export enum TransactionType {
  INCOME = 'Ingreso',
  EXPENSE = 'Gasto',
}

export enum MembershipStatus {
  ACTIVE = 'Activo',
  INACTIVE = 'Inactivo',
  PENDING = 'Pendiente',
}

export type SubscriptionPlan = 'Basic' | 'Standard' | 'Full' | 'CrossFit';

export type UserRole = 'admin' | 'instructor' | 'client';

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor';
  password?: string; 
}

export interface Reward {
  id: string;
  name: string;
  points: number;
}

// NUEVO: Tipos para plantillas de mensajes
export type MessageTemplateType = 'whatsapp_debt_reminder' | 'whatsapp_debt_urgent' | 'whatsapp_debt_promo' | 'whatsapp_birthday' | 'whatsapp_rescue' | 'email_debt_subject' | 'email_debt_body';

export interface MessageTemplate {
  id: string; 
  type: MessageTemplateType;
  label: string; 
  content: string; 
  description: string; 
}

export interface GymSettings {
  name: string;
  logoUrl: string;
  plan: SubscriptionPlan; 
  membershipPrices: {
    basic: number;
    intermediate: number;
    full: number;
    crossfit: number;
  };
  rewards?: Reward[];
  // NUEVO: Plantillas personalizadas
  messageTemplates?: MessageTemplate[];
}

export interface CompletedRoutine {
  date: string;
  routineName: string;
  pointsEarned: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: MembershipStatus;
  balance: number; 
  plan: string; 
  points: number;
  level: 'Bronze' | 'Silver' | 'Gold';
  streak: number; 
  lastVisit: string;
  birthDate: string; 
  assignedRoutineId?: string | null;
  routineStartDate?: string | null; 
  emergencyContact?: string;
  lastMembershipPayment?: string;
  password?: string; 
  routineHistory?: CompletedRoutine[]; 
}

export interface Transaction {
  id: string;
  clientId?: string;
  clientName?: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  createdBy?: string; 
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
}

export interface CheckIn {
  id: string;
  clientId: string;
  clientName: string;
  timestamp: string; 
  checkoutTimestamp?: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  machine?: string;
  sets: number;
  reps: string;
  notes?: string;
  completed?: boolean; 
}

export interface Routine {
  id: string;
  name: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  description: string;
  exercises: Exercise[]; 
}

// --- CROSSFIT TYPES ---

export type WodType = 'AMRAP' | 'EMOM' | 'FOR_TIME' | 'TABATA' | 'STRENGTH';

export interface WOD {
  id: string;
  date: string; 
  name: string; 
  type: WodType;
  description: string; 
  timeCap?: number; 
  exercises?: string[]; 
}

export interface ClassSession {
  id: string;
  date: string; 
  time: string; 
  coachId: string;
  coachName: string;
  capacity: number;
  attendees: string[]; 
  wodId?: string; 
}

export interface Booking {
  id: string;
  classId: string;
  clientId: string;
  clientName: string;
  timestamp: string; 
  status: 'confirmed' | 'cancelled' | 'waitlist';
}

export interface WODScore {
  id: string;
  wodId: string;
  clientId: string;
  clientName: string;
  date: string;
  score: string; 
  isRx: boolean; 
  notes?: string;
}

export interface TimeSlot {
  hour: string; 
  occupancyScore: number; 
  isDeadHour: boolean;
}

export interface BusinessPrediction {
  predictedRevenue: number;
  revenueTrendPercentage: number; 
  summary: string;
  marketingStrategy: string;
  suggestedHappyHours: string[];
  hourlyHeatmap: TimeSlot[];
}
