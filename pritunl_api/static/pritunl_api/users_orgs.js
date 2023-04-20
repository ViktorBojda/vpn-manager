const urlBase = "/pritunl/api/";
const orgTemplate = (orgData) =>
    `<div id=org-${orgData.id} class='card my-3 org-wrapper'>
        <div class='card-header row mx-0 px-0 align-items-center'>
            <div class="col-auto">
                <span class="pe-3 me-3 border-end"><input class="form-check-input org-check" type="checkbox" name="checkbox" aria-label="Select checkbox"></span>
                <span class="org-data-name">${orgData.name}</span>
            </div>
        </div>
        <ul class='list-group list-group-flush user-list'></ul>
    </div>`;
const userTemplate = (userData) =>
    `<li id="user-${userData.id}" class="list-group-item row d-flex mx-0 px-0 align-items-center user-item hidden">
        <div class="col-auto">
            <span class="pe-3 me-3 border-end"><input class="form-check-input user-check" type="checkbox" name="checkbox" aria-label="Select checkbox"></span>
            <span class="user-data-name">${userData.name}</span>
        </div>
        <div class="col d-flex column-gap-3 justify-content-end">
            <button type="button" class="btn btn-primary user-links-btn ms-3">Links</button>
        </div>
    </li>`;

function searchOrgs(value) {
    $('.org-data-name').each(function() {
        const orgWrapper = $(this).closest('.org-wrapper');
        ($(this).text().toLowerCase().indexOf(value) > -1) ? orgWrapper.removeClass('d-none') : orgWrapper.addClass('d-none');
    });
}

function searchUsers(value) {
    $('.org-wrapper:visible .user-data-name').each(function() {
        const userItem = $(this).closest('.user-item');
        ($(this).text().toLowerCase().indexOf(value) > -1) ? userItem.removeClass('d-none') : userItem.addClass('d-none');
    });
}

function deleteSelected(orgs, users) {
    const ajaxCalls = [];
    orgs.each((_, org) => ajaxCalls.push(deleteOrgApi({orgID: $(org).data('id')})));
    users.each((_, user) => ajaxCalls.push(deleteUserApi({orgID: $(user).data('orgID'), userID: $(user).data('id')})));
    $.when.apply($, ajaxCalls).then(function() {
        $("#modal").modal("hide");
    })
}

function addOrg() {
    const data = parseFormData();
    createOrgApi({
        data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function editOrg() {
    const data = parseFormData();
    updateOrgApi({
        orgID: data.id, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function bulkAddUsers() {
    const data = parseFormData();
    const userList = [];

    const lines = data.user_list.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "")
            continue;
        
        const values = lines[i].split(",");
        const name = values[0].trim();
        const email = values[1] ? values[1].trim() : "";

        userList.push({ name: name, email: email });
    }
    bulkCreateUsersApi({
        orgID: data.organization, data: {'user_list': userList},
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function addUser() {
    const data = parseFormData();
    if ('groups' in data && data.groups != null)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    createUserApi({
        orgID: data.organization, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function editUser() {
    const data = parseFormData();
    if ('groups' in data && data.groups != null)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    updateUserApi({
        orgID: data.organization, userID: data.id, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function configureNavbarBtns(orgData) {
    if (orgData.length == 0) {
        $('#btn-add-user').prop('disabled', true);
        $('#btn-bulk-add-users').prop('disabled', true);
        console.log("No organizations found, you must add organization before you can add user!");
        $('#btn-del-select').prop('disabled', true);
        return;
    }
    $('#btn-add-user').prop('disabled', false).off('click').on('click', () => showAddEditUserModal('add', orgData));
    $('#btn-bulk-add-users').prop('disabled', false).off('click').on('click', () => showBulkAddUsersModal(orgData));
}

function configureUserList(userData) {
    userData.forEach((data, _) => {
        if (data.type === 'server') {
            $(`#org-${data.organization} #user-${data.id}`).remove();
            return;
        }
        $(`#org-${data.organization} #user-${data.id} .user-links-btn`)
            .off('click').on('click', () => fetchUserLinksApi({
                orgID: data.organization, userID: data.id,
                doneCallbacks: [{func: showUserLinksModal}]}));
    });
}

function rebuildUsersByOrgID(orgID) {
    fetchUsersByOrgIdApi({
        orgID: orgID,
        doneCallbacks: [{
            func: rebuildElements,
            args: {
                prefix: 'user', contSelector: `#org-${orgID} .user-list`, template: userTemplate, 
                callbacks: [
                    configureUserList, [insertIDsIntoCheckboxes, 'user', 'org', 'organization'],
                    [insertEditModal, 'user', 'name', showAddEditUserModal, 'org', 'organization'], checkForCheckBoxes
                ]
            }
        }]
    });
}

function rebuildOrgs() {
    return fetchOrgsApi({
        doneCallbacks: [{
            func: rebuildElements,
            args: {
                prefix: 'org', contSelector: '#orgs-container', template: orgTemplate, 
                callbacks: [
                    configureNavbarBtns, [insertIDsIntoCheckboxes, 'org'],
                    [insertEditModal, 'org', 'name', showAddEditOrgModal], checkForCheckBoxes
                ]
            }
        }]
    });
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
$('#input-search-orgs').on('input', (ev) => searchOrgs($(ev.target).val()));
$('#input-search-users').on('input', (ev) => searchUsers($(ev.target).val()));

$(document).on("change", ".org-check", function () {
    $(this).closest('.org-wrapper').find(".user-list").find(".user-check").prop({
        "disabled": $(this).is(":checked"),
        "checked": $(this).is(":checked")
    });
});

$(document).on("change", "input[name='checkbox']", checkForCheckBoxes);

$(function () {
    fetchAllData();
    listenForEvents();
});
