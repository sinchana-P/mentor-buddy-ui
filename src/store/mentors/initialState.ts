import type { MentorsState } from "./types";

export const initialState: MentorsState = {
  mentors: [],
  selectedMentor: null,
  mentorBuddies: null,
  loading: false,
  error: null,
  total: 0,
  filters: {},
};