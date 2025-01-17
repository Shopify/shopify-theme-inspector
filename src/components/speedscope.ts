window.addEventListener('message', async (event) => {
  if (event.data.type === 'loadProfile') {
    
    // Send a paste event to speedscope, which is a supported way to load profile data.
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer()
    });
    if (pasteEvent.clipboardData) {
      pasteEvent.clipboardData.setData('text/plain', event.data.profileData);
      document.dispatchEvent(pasteEvent);
    }
  }
});
