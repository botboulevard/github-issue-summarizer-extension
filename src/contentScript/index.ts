console.log('Content script loaded!')

// interface ServerResponse {
//   index: number
//   message: {
//     role: string
//     content: string
//   }
//   finish_reason: string
// }

// {
//   "delayTime": 1426,
//   "executionTime": 26071,
//   "id": "sync-ce0dd94d-d38d-4b0c-88ae-de2dc56afed8-u1",
//   "output": {
//       "input_tokens": 513,
//       "output_tokens": 256,
//       "text": [
//           "\n                Sure, I can help you with that! Here's the issue in three sections with two bullet points each:\n                \n                1. What is the issue talking about?\n                \n                \t* The issue is about implementing previewing on active pick for Quick Search in Visual Studio Code.\n                \t* The feature allows users to view the search results in-editor when they have an item highlighted in the list.\n                \n                2. What is the current status?\n                \n                \t* The feature has been implemented, and the preview editor shows the result in-editor when an item is highlighted in the list.\n                \t* There are current limitations, such as the editor navigation being included in the history and opened windows accumulating if preview editors are not enabled.\n                \n                3. What help is given or needed?\n                \n                \t* The issue provides a link to a GIF demonstrating the feature and its current limitations.\n                \t* No help is explicitly requested, but the issue may need further testing and feedback to ensure the feature is working as intended.\n\nHere's the output in markdown format:\n\nIssue Summary\n============\n\nThe issue"
//       ]
//   },
//   "status": "COMPLETED"
// }

interface ServerResponse {
  delayTime: number
  executionTime: number
  id: string
  output: {
    input_tokens: number
    output_tokens: number
    text: string[]
  }
  status: string
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
        if (!backend) return
        fetch(backend, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url }),
        })
          .then((response) => response.json())
          .then((data: ServerResponse) => {
            console.log('Success:', data)
            if (data.status === 'COMPLETED') {
              chrome.storage.local.set({ [url]: data.output.text.join() }, function () {
                console.log('key is set to ' + url)
                console.log('Value is set to ' + data.output.text.join())
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
