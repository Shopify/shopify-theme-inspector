import nullthrows from 'nullthrows';
import {AccessToken} from 'types';
import {getCurrentTabURL} from '.';

export async function getProfileData() {
  const parser = new DOMParser();
  const {accessToken} = await requestAccessToken();
  const url = await getCurrentTabURL();

  url.searchParams.set('profile_liquid', 'true');

  const response = await fetch(url.href, {
    headers: {Authorization: `Bearer ${accessToken}`},
  });

  if (response.ok) {
    const html = await response.text();
    const document = parser.parseFromString(html, 'text/html');
    let profileData;
    if (profileExists(document)) {
      profileData = JSON.parse(
        nullthrows(document.querySelector('#liquidProfileData')).innerHTML,
      );
    } else {
      return false;
    }

    return cleanProfileData(profileData);
  }

  throw Error(response.statusText);
}

function profileExists(document: HTMLDocument) {
  return document.querySelector('#liquidProfileData') !== null;
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
