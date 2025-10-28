import * as constants from "./constants";
import type { MentorRO, MentorBuddiesRO } from "./types";

export const setMentors = (mentors: MentorRO[]) => ({
  type: constants.SET_MENTORS,
  payload: mentors,
});

export const addMentor = (mentor: MentorRO) => ({
  type: constants.ADD_MENTOR,
  payload: mentor,
});

export const updateMentor = (mentor: MentorRO) => ({
  type: constants.UPDATE_MENTOR,
  payload: mentor,
});

export const deleteMentor = (mentorId: string) => ({
  type: constants.DELETE_MENTOR,
  payload: mentorId,
});

export const setSelectedMentor = (mentor: MentorRO | null) => ({
  type: constants.SET_SELECTED_MENTOR,
  payload: mentor,
});

export const setMentorBuddies = (data: MentorBuddiesRO) => ({
  type: constants.SET_MENTOR_BUDDIES,
  payload: data,
});

export const setLoading = (loading: boolean) => ({
  type: constants.SET_LOADING,
  payload: loading,
});

export const setError = (error: string | null) => ({
  type: constants.SET_ERROR,
  payload: error,
});

export const clearError = () => ({
  type: constants.CLEAR_ERROR,
});