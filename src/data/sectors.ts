import { SectorId } from '../types/job';

export interface SectorInfo {
  id: SectorId;
  name: string;
  tagline: string;
  badgeCode: string;
  majorOrgs: string[];
}

export const SECTORS: SectorInfo[] = [
  {
    id: 'upsc',
    name: 'UPSC & Civil Services',
    tagline: 'IAS, IFS, IPS, NDA, CDS, CMS & Central Group A',
    badgeCode: 'UPSC',
    majorOrgs: ['UPSC', 'Civil Services', 'NDA', 'CDS', 'IES'],
  },
  {
    id: 'ssc',
    name: 'SSC (Staff Selection)',
    tagline: 'CGL, CHSL, MTS, CPO SI, GD Constable & Steno',
    badgeCode: 'SSC',
    majorOrgs: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD', 'SSC CPO'],
  },
  {
    id: 'banking',
    name: 'Banking & Insurance',
    tagline: 'IBPS PO/Clerk, SBI PO, RBI Grade B, LIC & NABARD',
    badgeCode: 'BANK',
    majorOrgs: ['SBI', 'IBPS', 'RBI', 'LIC', 'NABARD', 'SEBI'],
  },
  {
    id: 'railways',
    name: 'Indian Railways (RRB)',
    tagline: 'RRB NTPC, ALP, Group D, Junior Engineer & RPF',
    badgeCode: 'RAIL',
    majorOrgs: ['RRB NTPC', 'RRB ALP', 'RRB JE', 'RPF SI', 'RRC Group D'],
  },
  {
    id: 'defence',
    name: 'Defence & Paramilitary',
    tagline: 'Indian Army, Navy, Air Force, CISF, BSF, ITBP & Police',
    badgeCode: 'DEFENCE',
    majorOrgs: ['Army Agniveer', 'IAF Vayu', 'Navy SSR', 'CISF', 'BSF', 'CAPF'],
  },
  {
    id: 'teaching',
    name: 'Teaching & Academics',
    tagline: 'CTET, UGC NET, KVS, NVS, DSSSB, State TET & Asst Professor',
    badgeCode: 'EDU',
    majorOrgs: ['CBSE CTET', 'NTA UGC NET', 'KVS', 'NVS', 'DSSSB'],
  },
  {
    id: 'state-psc',
    name: 'State Public Service',
    tagline: 'UPPSC, BPSC, MPPSC, MPSC, RPSC, WBPSC & State Subordinate',
    badgeCode: 'STATE',
    majorOrgs: ['UPPSC', 'BPSC', 'MPPSC', 'MPSC', 'RPSC', 'WBPSC'],
  },
  {
    id: 'psu',
    name: 'PSU & Engineering',
    tagline: 'GATE Trainees, ISRO, DRDO, IOCL, ONGC, BHEL & NTPC',
    badgeCode: 'ENGG',
    majorOrgs: ['ISRO', 'DRDO', 'IOCL', 'ONGC', 'BHEL', 'NTPC', 'BARC'],
  },
  {
    id: 'healthcare',
    name: 'Medical & Healthcare',
    tagline: 'AIIMS NORCET, ESIC Medical Officer, NHM Nursing & AYUSH',
    badgeCode: 'HEALTH',
    majorOrgs: ['AIIMS NORCET', 'ESIC', 'State NHM', 'UPSC CMS'],
  },
];
