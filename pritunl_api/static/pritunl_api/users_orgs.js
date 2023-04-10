const urlBase = "/pritunl/api/";
const orgTemplate = (orgData) =>
    `<div id=org-${orgData.id} class='card my-3 org-wrapper'>
        <div class='card-header org-header'>
            <input class="form-check-input org-check" type="checkbox" name="checkbox" value="${orgData.id}" aria-label="Select checkbox">
            <span class="org-data-name">${orgData.name}</span>
        </div>
        <ul class='list-group list-group-flush d-flex user-list'></ul>
    </div>`;
const userTemplate = (userData) =>
    `<li id="user-${userData.id}" class="list-group-item user-item">
        <input class="form-check-input user-check" type="checkbox" name="checkbox" value="${userData.organization},${userData.id}" aria-label="Select checkbox">
        <span class="user-data-name">${userData.name}</span>
        <button type="button" class="btn btn-primary btn-profile-links ms-3">Links</button>
    </li>`;

function deleteSelected(selected, url) {
    let ajaxCalls = []
    selected.each(function () {
        let destUrl = url;
        $(this).val().split(",").forEach(ID => destUrl = destUrl.replace("%s", ID))
        ajaxCalls.push(
            $.ajax({
                type: "DELETE",
                url: urlBase + destUrl
            }).fail(function (xhr) {
                alert(xhr.responseText);
            })
        );
    });
    return ajaxCalls;
}

function deleteAllSelected(orgs, users) {
    let ajaxCalls = [];
    if (orgs.length)
        ajaxCalls = ajaxCalls.concat(deleteSelected(orgs, "organizations/%s/delete/"));
    if (users.length)
        ajaxCalls = ajaxCalls.concat(deleteSelected(users, "organizations/%s/users/%s/delete/"));
    return ajaxCalls;
}

function submitAddOrg() {
    let data = parseFormData();
    createOrg(data);
}

function submitEditOrg() {
    let data = parseFormData();
    let orgID = data.organization;
    delete data.organization;
    updateOrg(orgID, data);
}

function submitAddUser() {
    let data = parseFormData();
    let orgID = data.organization;
    delete data.organization;
    createUser(orgID, data);
}

function submitEditUser() {
    let data = parseFormData();
    let orgID = data.organization;
    delete data.organization;
    let userID = data.id;
    delete data.id;
    updateUser(orgID, userID, data);
}

function toggleBtns(orgData) {
    if (orgData.length == 0) {
        $('#btn-add-user').prop('disabled', true);
        console.log("No organizations found, you must add organization before you can add user!");
        $('#btn-del-select').prop('disabled', true);
        return;
    }
    $('#btn-add-user').prop('disabled', false).off('click').on('click', () => showAddEditUserModal('add', orgData));
}

function setOrgEdits(orgData) {
    orgData.forEach((data, _) => {
        let $orgName = $(`#org-${data.id} .org-data-name`);
        if ($orgName.length)
            $orgName.off('click').on('click', () => showAddEditOrgModal('edit', data));
    });
}

function setUserEdits(userData) {
    userData.forEach((data, _) => {
        let $userName = $(`#org-${data.organization} #user-${data.id} .user-data-name`);
        if ($userName.length)
            $userName.off('click').on('click', () => showAddEditUserModal('edit', data));
    });
}

function rebuildUsersByOrgID(orgID) {
    return fetchUsersByOrgID(orgID, [rebuildElements, 'user', `#org-${orgID} .user-list`, userTemplate, [setUserEdits, checkForCheckBoxes]]);
}

function rebuildOrgs() {
    return fetchOrgs([rebuildElements, 'org', '#orgs-container', orgTemplate, [toggleBtns, setOrgEdits, checkForCheckBoxes]]);
}

function fetchAllData() {
    $.when(rebuildOrgs()).then(function (orgData) {
        orgData.forEach(org => {
            rebuildUsersByOrgID(org.id);
        });
    })
}

$("#btn-del-select").on("click", showDeleteUsersOrgsModal);
$("#btn-add-org").on("click", () => showAddEditOrgModal('add'));

$(document).on("change", ".org-check", function () {
    $(this).parent().siblings(".user-list").find(".user-check").prop({
        "disabled": $(this).is(":checked"),
        "checked": $(this).is(":checked")
    });
});

$(document).on("change", "input[name='checkbox']", checkForCheckBoxes);

$(function () {
    fetchAllData();
    listenForEvents();
});
