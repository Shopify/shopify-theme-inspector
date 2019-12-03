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
  start_time: string;
  end_time: string;
  self_time: string;
  total_time: string;
  children: ProfileNode[];
}

interface FormattedProfileNode {
  name: string;
  value: string;
  children: FormattedProfileNode[];
  code: string;
  line: number;
}

interface FormattedProfileData {
  name: string;
  value: number;
  children: FormattedProfileNode[];
  code: string;
  line: string;
}
