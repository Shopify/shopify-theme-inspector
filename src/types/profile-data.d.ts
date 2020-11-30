/* eslint-disable babel/camelcase */
interface ProfileData {
  name: string;
  value: number;
  children: ProfileNode[];
}

interface ProfileNode {
  code: string;
  partial: string;
  line_number: number;
  total_time: string;
  children: ProfileNode[];
}

interface FormattedProfileNode {
  name: string;
  filename: string | null;
  value: string;
  children: FormattedProfileNode[];
  code: string | null;
  line: number;
}

interface FormattedProfileData {
  name: string;
  filename: string | null;
  value: number;
  children: FormattedProfileNode[];
  code: string;
  line: string;
}
