import * as React from "react"
import './App.css'

import { FileUploader } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

function App() {
  const [message, setMessage] = React.useState('')
  const onSuccess = ({ key }) => {
    const url = "https://i3rwbvd2al.execute-api.us-west-2.amazonaws.com/staging/createnote/"+key
    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setMessage(data)
    })
    .catch((err) => {
      console.log(err.message)
    })
  }
  return (
    <div className="App">
      <header className="App-header">
        <FileUploader
          onSuccess={onSuccess}
          variation="drop"
          maxFiles={1}
          acceptedFileTypes={['.pptx']}
          accessLevel="public"
        />
        {message}
      </header>
    </div>
  );
}

export default App;
