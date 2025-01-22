import {SubjectAccessToken} from 'types';
import { CoreAccessTokenResponse } from '../types/messages';

export async function getProfileData(
  url: URL): Promise<any> {

  try {
    const fetchOptions = {
      headers: {
        Accept: 'application/vnd.speedscope+json',
        Authorization: `Bearer ${await requestAccessToken(url).then(({accessToken}) => accessToken)}`,
      },
    };

    const response = await fetch(url.href, fetchOptions);
    if (!response.ok) {
      throw new Error('Not profilable');
    }
    return response.json();
  } catch (error) {
    throw new Error('Not profilable');
  }
}

function requestAccessToken(
  {origin}: URL): Promise<SubjectAccessToken> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {type: 'request-core-access-token', origin},
    ).then((response: CoreAccessTokenResponse) => {
      if (response.error) {
        return reject(response.error);
      }
      return resolve(response.token!);
    });
  });
}
