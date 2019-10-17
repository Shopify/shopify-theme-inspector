export default async function getProfileData() {
  let profileData;
  try {
    const url = new URL(await getProfileURL());
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

function formatLiquidProfileData(entries) {
  return entries.map(function(entry) {
    return {
      name: `${entry.partial}`,
      value: entry.total_time,
      children: formatLiquidProfileData(entry.children),
      code: entry.code,
      line: entry.line_number,
    };
  });
}

function getProfileURL(): Promise<string> {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval(
      'window.location.href',
      (result: string) => resolve(result),
    );
  });
}

function cleanProfileData(profileData: {name: any; value: any; children: any}) {
  const cleanData = {
    name: profileData.name,
    value: profileData.value,
    children: formatLiquidProfileData(profileData.children),
  };
  return cleanData;
}
