import {getURL} from '.';

export async function getProfileData() {
  let profileData;
  try {
    const url = new URL(await getURL());
    url.searchParams.set('profile_liquid', 'true');
    const response = await fetch(url.href);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    profileData = JSON.parse(
      doc.querySelector('#liquidProfileData')!.innerHTML,
    );
  } catch (error) {
    console.log(error);
  }
  return cleanProfileData(profileData);
}

function formatLiquidProfileData(
  entries: ProfileNode[],
): FormattedProfileNode[] {
  return entries.map(function(entry: ProfileNode) {
    return {
      name: `${entry.partial}`,
      value: entry.total_time,
      children: formatLiquidProfileData(entry.children),
      code: entry.code,
      line: entry.line_number,
    };
  });
}

function cleanProfileData(profileData: {name: any; value: any; children: any}) {
  const cleanData = {
    name: profileData.name,
    value: profileData.value,
    code: '-',
    line: '-',
    children: formatLiquidProfileData(profileData.children),
  };
  return cleanData;
}
