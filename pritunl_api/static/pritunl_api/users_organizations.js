const urlBase = "/pritunl/api/";
const orgTemplate = (orgData) =>
    `<div id=org-${orgData.id} class='card my-3 org-wrapper'>
        <div class='card-header org-header'>
            <input class="form-check-input org-check" type="checkbox" name="del-check" value="${orgData.id}" aria-label="Select checkbox">
            <span class="org-name">${orgData.name}</span>
        </div>
        <ul class='list-group list-group-flush d-flex user-list'></ul>
    </div>`;
const userTemplate = (userData) =>
    `<li id="user-${userData.id}" class="list-group-item user-item">
        <input class="form-check-input user-check" type="checkbox" name="del-check" value="${userData.organization},${userData.id}" aria-label="Select checkbox">
        <span class="user-name">${userData.name}</span>
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
    let formData = $("form").serializeArray();
    let org = {};

    formData.forEach(function (item, idx, object) {
        if (item.value.trim().length === 0)
            object.splice(idx, 1);
        else
            org[item.name] = item.value;
    });

    $.ajax({
        method: "POST",
        url: urlBase + "organizations/create/",
        data: org
    }).done(function (response) {
        $("#modal").modal("hide");
        fetchOrgs();
    }).fail(function (xhr) {
        alert(xhr.responseText);
    })
}

function submitAddUser() {
    let formData = $("#form").serializeArray();
    let user = {};

    formData.forEach(function(item, idx, object) {
        if (item.value.trim().length === 0)
            object.splice(idx, 1);
        else
            user[item.name] = item.value;
    });
    let orgID = user.organization;
    delete user.organization;

    $.ajax({
        method: "POST",
        url: urlBase + "organizations/" + orgID + "/users/create/",
        data: user
    }).done(function() {
        $("#modal").modal("hide");
        fetchUsersByOrgID(orgID);
    }).fail(function(xhr) {
        alert(xhr.responseText);
    })
}

function toggleAddUserBtn(orgData) {
    if (orgData.length == 0) {
        $('#btn-add-user').prop('disabled', true);
        console.log("No organizations found, you must add organization before you can add user!");
        return;
    }
    $('#btn-add-user').prop('disabled', false).off('click').on('click', () => showAddUserModal(orgData));
}

function fetchUsersByOrgID(orgID) {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/" + orgID + "/users/"
    }).done(function (data) {
        rebuildElements(data, 'user', `#org-${orgID} .user-list`, userTemplate, ['name']);
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchOrgs() {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/"
    }).done(function (data) {
        rebuildElements(data, 'org', '#orgs-container', orgTemplate, ['name'], toggleAddUserBtn);
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchAllData() {
    $.when(fetchOrgs()).then(function (orgData) {
        orgData.forEach(org => {
            fetchUsersByOrgID(org.id);
        });
    })
}

$("#btn-del-select").on("click", showDeleteUsersOrgsModal);
$("#btn-add-org").on("click", showAddOrgModal);

$(document).on("change", ".org-check", function () {
    $(this).parent().siblings(".user-list").find(".user-check").prop({
        "disabled": $(this).is(":checked"),
        "checked": $(this).is(":checked")
    });
});

$(document).on("change", "input[name='del-check']", function () {
    $("#btn-del-select").prop('disabled', !$("input[name='del-check']:checked").length);
});

$(function () {
    fetchAllData();
    listenForEvents();
});
