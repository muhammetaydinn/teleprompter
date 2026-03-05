'use strict';

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  // Önce mevcut content script'e mesaj göndermeyi dene
  chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE' }, () => {
    if (!chrome.runtime.lastError) return; // Başarılı

    // Content script bu tab'da yüklü değil — programatik olarak inject et
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, files: ['content.js'] },
      () => {
        if (chrome.runtime.lastError) {
          // chrome://, about: gibi kısıtlı sayfalar — sessizce geç
          return;
        }
        // Inject sonrası mesajı gönder
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE' }, () => {
          void chrome.runtime.lastError;
        });
      }
    );
  });
});
