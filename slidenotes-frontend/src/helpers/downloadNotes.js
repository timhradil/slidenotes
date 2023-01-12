const downloadNotes = (id, title) => {
  const url = "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/downloadNotes"
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({id: id})
  }
  fetch(url, requestOptions)
  .then((response) => response.text())
  .then((data) => {
    var byteString = atob(data);

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    var blob = new Blob([ia], { type: "application/pdf" });
    const url = window.URL.createObjectURL(
      blob,
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      title + '.pdf',
    );
    document.body.appendChild(link); 
    link.click();
    link.parentNode.removeChild(link);
  })
  .catch((err) => {
    console.log(err.message)
  })
}

export default downloadNotes
