const getObjects = (objects) => {
  const objects23 = objects
  return (uuid) => { 
      console.log('getObjects objects', objects)
      console.log('getObjects objects23', objects23)
      console.log('getObjects uuid', uuid)
    }
}

hash.getObjects('uuid23')
