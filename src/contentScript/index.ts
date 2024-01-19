console.log('Content script loaded!')

interface ServerResponse {
  index: number
  message: {
    role: string
    content: string
  }
  finish_reason: string
}

const backend = import.meta.env.VITE_BACKEND_URL
const currentUrl = window.location.href

function getSummary(url: string) {
  if (url) {
    chrome.storage.local.get(url, function (result) {
      console.log('Value currently is object ' + JSON.stringify(result))
      if (result[url]) {
        console.log('Value currently is ' + result[url])
        console.log('chrome.action   ', chrome.action)
        // chrome.action?.openPopup()
        return
      } else {
        if(!backend)
          return
        fetch(backend, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url }),
        })
          .then((response) => response.json())
          .then((data: ServerResponse) => {
            // console.log('Success:', data)
            if (data.finish_reason === 'stop') {
              chrome.storage.local.set({ [url]: data.message.content }, function () {
                console.log('key is set to ' + url)
                console.log('Value is set to ' + data.message.content)
                // open popup.js
                // chrome.action?.openPopup()
              })
            }
          })
          .catch((error) => {
            console.error('Error:', error)
          })
      }
    })
  }
}

getSummary(currentUrl)

// chrome.storage.local.onChanged.addListener((
//   changes: {
//     [key: string]: chrome.storage.StorageChange;
//   }
// ) => {
//   console.log('changes', changes)
// }
// )
