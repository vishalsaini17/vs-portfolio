/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  SocialLink,
  ContactInfo,
  ServiceCard,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  HomeSection,
  HomeSectionCard,
  ResumeSection,
  ResumeSectionCard,
} from './types';

export interface ProfileDetails {
  profileName: string;
  profileTitle: string;
  profileAvatar: string;
  socialLinks: SocialLink[];
  contactInfo: ContactInfo;
  services: ServiceCard[];
  educationHistory: EducationItem[];
  experienceHistory: ExperienceItem[];
  workSkills: string[];
  softSkills: string[];
  projects: ProjectItem[];
  aboutTitle?: string;
  aboutDescription?: string;
  homeSections?: HomeSection[];
  resumeSections?: ResumeSection[];
  contactTitle?: string;
  contactDescription?: string;
  blogTitle?: string;
  blogDescription?: string;
  blogEnabled?: boolean;
}

interface ProfileContextType {
  profile: ProfileDetails;
  loading: boolean;
  error: string | null;
  saveProfile: (updatedProfile: ProfileDetails) => Promise<void>;
}

const emptyProfile: ProfileDetails = {
  profileName: '',
  profileTitle: '',
  profileAvatar: '',
  socialLinks: [],
  contactInfo: {
    phone: [],
    email: '',
    location: ''
  },
  services: [],
  educationHistory: [],
  experienceHistory: [],
  workSkills: [],
  softSkills: [],
  projects: [],
  aboutTitle: '',
  aboutDescription: '',
  homeSections: [],
  resumeSections: [],
  contactTitle: '',
  contactDescription: '',
  blogTitle: '',
  blogDescription: '',
  blogEnabled: false,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileDetails>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'profile', 'details');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          let rawSections = data.resumeSections ?? [];
          const legacyEdu = data.educationHistory || [];
          const legacyExp = data.experienceHistory || [];

          const migratedSections = rawSections.map((section: any) => {
            if (section.type === 'education' && (!section.cards || section.cards.length === 0)) {
              return {
                ...section,
                cards: legacyEdu.map((edu: any, index: number) => ({
                  id: `migrated-edu-${index}`,
                  title: edu.degree || '',
                  subtitle: edu.institution || '',
                  period: edu.period || '',
                  description: edu.description || '',
                  width: edu.width || '100%'
                }))
              };
            }
            if (section.type === 'experience' && (!section.cards || section.cards.length === 0)) {
              return {
                ...section,
                cards: legacyExp.map((exp: any, index: number) => ({
                  id: `migrated-exp-${index}`,
                  title: exp.role || '',
                  subtitle: exp.company || '',
                  period: exp.period || '',
                  description: exp.description || '',
                  width: exp.width || '100%'
                }))
              };
            }
            return section;
          });

          setProfile({
            profileName: data.profileName ?? '',
            profileTitle: data.profileTitle ?? '',
            profileAvatar: data.profileAvatar ?? '',
            socialLinks: (data.socialLinks ?? []).map((link: any) => {
              if (link.platform === 'github' && (!link.url || link.url === '' || link.url === 'https://github.com')) {
                return { ...link, url: 'https://github.com/vishalsaini17/vishal-portfolio' };
              }
              return link;
            }),
            contactInfo: data.contactInfo ?? { phone: [], email: '', location: '' },
            services: data.services ?? [],
            educationHistory: data.educationHistory ?? [],
            experienceHistory: data.experienceHistory ?? [],
            workSkills: data.workSkills ?? [],
            softSkills: data.softSkills ?? [],
            projects: (data.projects ?? []).map((proj: any) => {
              if (!proj.githubUrl || proj.githubUrl === '' || proj.githubUrl === 'https://github.com') {
                return { ...proj, githubUrl: 'https://github.com/vishalsaini17/vishal-portfolio' };
              }
              return proj;
            }),
            aboutTitle: data.aboutTitle ?? '',
            aboutDescription: data.aboutDescription ?? '',
            homeSections: data.homeSections ?? [],
            resumeSections: migratedSections,
            contactTitle: data.contactTitle ?? '',
            contactDescription: data.contactDescription ?? '',
            blogTitle: data.blogTitle ?? '',
            blogDescription: data.blogDescription ?? '',
            blogEnabled: data.blogEnabled ?? false,
          });
          setError(null);
        } else {
          setError('No profile details found in Firestore database.');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching live profile from Firestore:', err);
        setError(err.message || 'Failed to fetch profile details');
        setLoading(false);
        try {
          handleFirestoreError(err, OperationType.GET, 'profile/details');
        } catch (fErr) {
          // Keep it from crashing client-side initial mount
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const saveProfile = async (updatedProfile: ProfileDetails) => {
    const docRef = doc(db, 'profile', 'details');
    try {
      await setDoc(docRef, updatedProfile);
      setError(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'profile/details');
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, error, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
