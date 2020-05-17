import { Location } from "./location";
import { User } from "./user";

export interface EventSearchItem {
  eid: string;
  name: string;
}

export interface Event {
  eid: string;
  // Human-readable name for the event
  name: string;
  start_time: string;
  end_time: string;
  location: Location | null;
  description: string;
  public_event: boolean;
  capacity: number | null;
  remaining_capacity: number;
  //Guests invited to event
  rsvps: RSVP[];
  user_rsvp: RSVP;
  //Whether the current user can edit this event
  can_edit: boolean;
  categories: Category[];
}

export interface UpdateEvent {
  name: string;
  start_time: string;
  end_time: string;
  location_id: string | null;
  description: string;
  public_event: boolean;
  capacity: number | null;
  categories: Category[];
}

export interface RSVP {
  event: Event;
  guest: User;
  response: InviteResponse;
}

export enum InviteResponse {
  INVITED = "INVITED",
  ATTENDING = "ATTENDING",
  NOT_ATTENDING = "NOT_ATTENDING",
}

export interface EventFilter {
  happening_now: boolean;
  location: string | null;
  categories: Category[];
}

// Kinds of events
export enum Category {
  ADVICE = "ADVICE",
  ARTS = "ARTS",
  BIOLOGY = "BIOLOGY",
  BUSINESS = "BUSINESS",
  CHEMISTRY = "CHEMISTRY",
  COMPUTER_SCIENCE = "COMPUTER_SCIENCE",
  CONCERT = "CONCERT",
  ECONOMICS = "ECONOMICS",
  FINE_ART = "FINE_ART",
  FREE_FOOD = "FREE_FOOD",
  GIVEAWAY = "GIVEAWAY",
  HISTORY = "HISTORY",
  LANGUAGES = "LANGUAGES",
  LAW = "LAW",
  LECTURE = "LECTURE",
  LITERATURE = "LITERATURE",
  MATHS = "MATHS",
  MEDICINE = "MEDICINE",
  MEETING = "MEETING",
  MUSIC = "MUSIC",
  PERFORMANCE = "PERFORMANCE",
  PHILOSOPHY = "PHILOSOPHY",
  PHYSICS = "PHYSICS",
  POLITICS = "POLITICS",
  PSYCHOLOGY = "PSYCHOLOGY",
  REHEARSAL = "REHEARSAL",
  SCIENCE = "SCIENCE",
  SEMINAR = "SEMINAR",
  SOCIAL = "SOCIAL",
  TALK = "TALK",
  THEATRE = "THEATRE",
  TUTORIAL = "TUTORIAL",
}
