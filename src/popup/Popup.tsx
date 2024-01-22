import { useState, useEffect } from 'react'
import './Popup.css'
import Markdown from 'react-markdown'
import { ProgressBar } from 'react-loader-spinner'

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

export const Popup = () => {
  const backend = import.meta.env.VITE_BACKEND_URL
  const [summary, setSummary] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log('tabs', tabs)
      const currentTab = tabs[0]
      if (currentTab && currentTab.url) {
        console.log('currentTab', currentTab)
        setCurrentUrl(currentTab.url)
      }
    })
  }, [])

  useEffect(() => {
    if (!currentUrl) return
    chrome.storage.local.get(currentUrl, (result) => {
      console.log('result', result)
      if (result && result[currentUrl]) {
        setSummary(result[currentUrl])
      } else {
        console.log('fetching from backend')
        fetch(backend, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: currentUrl }),
        })
          .then((response) => response.json())
          .then((data: ServerResponse) => {
            console.log('Success:', data)
            if (data.status === 'COMPLETED') {
              chrome.storage.local.set({ [currentUrl]: data.output.text.join() }, function () {
                console.log('key is set to ' + currentUrl)
                const api_response = data.output.text.join()

                console.log('Value is set to ' + api_response)
                setSummary(api_response)
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
    console.log('currentUrl', currentUrl)
    const listener = () => {
      chrome.storage.local.get(currentUrl, (result) => {
        console.log('result', result)
        if (result && result[currentUrl]) {
          setSummary(result[currentUrl])
        }
      })
    }
    chrome.storage.local.onChanged.addListener(listener)
    return () => {
      chrome.storage.local.onChanged.removeListener(listener)
    }
  }, [currentUrl])

  // useEffect(() => {
  //   // get from local storage
  //   if(currentUrl) {
  //     // console.log('currentUrl', currentUrl)
  //     // localstorage
  //     // console.log('localStorage', window.localStorage)
  //     chrome.storage.local.get(currentUrl, function (result) {
  //       // console.log('Value currently is ' + JSON.stringify(result))
  //       if(result && result[currentUrl]) {
  //         setSummary(result[currentUrl])
  //         return
  //       }
  //     })

  //   }
  // }, [currentUrl])

  return (
    <div
      style={{
        padding: '1rem',
        fontSize: '16px',
      }}
    >
      {summary ? (
        <Markdown>{summary}</Markdown>
      ) : (
        <ProgressBar
          visible={true}
          height="80"
          width="80"
          ariaLabel="progress-bar-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      )}
    </div>
  )
}

export default Popup
