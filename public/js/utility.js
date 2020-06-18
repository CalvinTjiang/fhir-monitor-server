
function redirectToMonitorView(statCode, type){
    location.href = `http://localhost:8080/monitor/${statCode}/${type}`
}

function removeMonitoredPatient(id, statCode){
    fetch(`http://localhost:8080/api/monitor/${statCode}/patient/${id}`, {
        method : "DELETE"
    })
    window.location.reload();
}

function redirectToPatientDetails(id){
    location.href = `http://localhost:8080/patient/${id}`
}