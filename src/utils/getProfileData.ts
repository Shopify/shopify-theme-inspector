import nullthrows from 'nullthrows';
import {SubjectAccessToken} from 'types';

export async function getProfileData(
  url: URL,
  withAuthorization = true,
): Promise<FormattedProfileData> {
  const parser = new DOMParser();

  const fetchOptions = {} as any;

  if (withAuthorization) {
    const {accessToken} = await requestAccessToken(url);
    fetchOptions.headers = {Authorization: `Bearer ${accessToken}`};
  }

  url.searchParams.set('profile_liquid', 'true');
  const response = await fetch(url.href, fetchOptions);

  if (!response.ok) throw Error(response.statusText);

  const html = await response.text();
  const document = parser.parseFromString(html, 'text/html');

  if (noProfileFound(document)) {
    throw Error('Liquid profile not found for this page');
  }

  const profileData = JSON.parse(
    nullthrows(document.querySelector('#liquidProfileData')).innerHTML,
  );

  return cleanProfileData(profileData);
}

function noProfileFound(document: HTMLDocument) {
  return document.querySelector('#liquidProfileData') === null;
}

function requestAccessToken({origin}: URL): Promise<SubjectAccessToken> {
  return new Promise((resolve, reject) => {
    return chrome.runtime.sendMessage(
      {type: 'request-core-access-token', origin},
      ({token, error}) => {
        if (error) {
          return reject(error);
        }
        return resolve(token);
      },
    );
  });
}

function formatLiquidProfileData(
  entries: ProfileNode[],
): FormattedProfileNode[] {
  return entries.map(function(entry: ProfileNode) {
    if (!entry.partial.includes(':')) {
      entry.partial = `snippet:${entry.partial}`;
    }
    return {
      name: `${entry.partial}`,
      value: entry.total_time,
      children: formatLiquidProfileData(entry.children),
      code: entry.code,
      line: entry.line_number,
    };
  });
}

function cleanProfileData(profileData: ProfileData) {
  const cleanData = {
    name: profileData.name,
    value: profileData.value,
    code: '-',
    line: '-',
    children: formatLiquidProfileData(profileData.children),
  };
  return cleanData;
}
