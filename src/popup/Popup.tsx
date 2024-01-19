import { useState, useEffect } from 'react'
import './Popup.css'
import Markdown from 'react-markdown'
import { ProgressBar } from 'react-loader-spinner'

export const Popup = () => {
  const [summary, setSummary] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
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
