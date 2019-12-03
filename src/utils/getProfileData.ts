import nullthrows from 'nullthrows';
import {AccessToken} from 'types';
import {getCurrentTabURL} from '.';

export async function getProfileData(): Promise<FormattedProfileData> {
  const parser = new DOMParser();
  const {accessToken} = await requestAccessToken();
  const url = await getCurrentTabURL();

  url.searchParams.set('profile_liquid', 'true');
  const response = await fetch(url.href, {
    headers: {Authorization: `Bearer ${accessToken}`},
  });

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

function requestAccessToken(): Promise<AccessToken> {
  return new Promise((resolve, reject) => {
    return chrome.runtime.sendMessage(
      {type: 'request-core-access-token'},
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
