const urlBase = "/pritunl/api/";
const orgTemplate = (id, name) =>
    `<div id=org-${id} class='card my-3 org-wrapper'>
        <div class='card-header org-header'>
            <input class="form-check-input org-check" type="checkbox" name="del-check" value="${id}" aria-label="Select checkbox">
            <span class="org-name">${name}</span>
        </div>
        <ul class='list-group list-group-flush user-list'></ul>
    </div>`;
const userTemplate = (id, name, org_id) =>
    `<li id="user-${id}" class="list-group-item d-flex user-item">
        <input class="form-check-input user-check" type="checkbox" name="del-check" value="${org_id},${id}" aria-label="Select checkbox">
        <span class="user-name">${name}</span>
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

$("#btn-del-select").on("click", function () {
    let orgs = $(".org-check:checked");
    let users = $(".user-check:checked:not(:disabled)");

    let itemList = $("<ul></ul>");
    if (orgs.length) {
        orgs.each(function () {
            itemList.append($("<li>" + $(this).siblings(".org-name").text() + "</li>"));
        });
    }
    if (users.length) {
        users.each(function () {
            itemList.append($("<li>" + $(this).siblings(".user-name").text() + "</li>"));
        });
    }

    $("#modal-header").text("Delete Selected");
    $("#modal-body").html(
        `<h2 class="fs-6">Are you sure you want to delete the following items?</h2>
        ${itemList.prop("outerHTML")}`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" id="modal-btn-del"class="btn btn-primary">Delete</button>`
    )

    $("#modal-btn-del").off().on("click", function () {
        $.when.apply($, deleteAllSelected(orgs, users)).then(function () {
            fetchAllData();
            $("#modal").modal("hide");
        });
    });

    $("#modal").modal("show");
});

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
        $.when(fetchOrgs()).then(function () {
            $("#orgs-container").append($(orgTemplate(response.id, response.name)));
            sortOrgs();
        });
    }).fail(function (xhr) {
        alert(xhr.responseText);
    })
}

$("#btn-add-org").on("click", function () {
    $("#modal-header").text("Add Group");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="form-input-name" name="name" required>
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" class="btn btn-primary">Add</button>`
    )

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddOrg();
    });

    $("#modal").modal("show");
});

function submitAddUser() {
    let formData = $("form").serializeArray();
    let user = {};

    formData.forEach(function (item, idx, object) {
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
    }).done(function (response) {
        $("#modal").modal("hide");
        $.when(fetchUsersByOrgID(orgID)).then(function () {
            $("#org-" + orgID + " .user-list").append(
                $(userTemplate(response[0].id, response[0].name, response[0].organization))
            );
            sortUserList(orgID);
        });
    }).fail(function (xhr) {
        alert(xhr.responseText);
    })
}

$("#btn-add-user").on("click", function () {
    if (!orgData.length) {
        console.error("No organizations found, you must add organization before you can add user!");
        return;
    }
    let orgSelect = $(
        `<select id='form-input-org' name='organization' class='form-select' required>
            <option value="" selected disabled>Select organization</option>
        </select>`
    );

    $.each(orgData, function (key, val) {
        orgSelect.append($(`<option value=${val.id}>${val.name}</option>`));
    });

    $("#modal-header").text("Add User");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="form-input-name" name="name" required>
            </div>
            <div class="mb-3">
                <label for="form-input-org" class="form-label">Organization</label>
                ${orgSelect.prop("outerHTML")}
            </div>
            <div class="mb-3">
                <label for="form-input-group" class="form-label">Groups</label>
                <input type="text" class="form-control" id="form-input-group" name="groups">
            </div>
            <div class="mb-3">
                <label for="form-input-email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="form-input-email" name="email">
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" class="btn btn-primary">Add</button>`
    )

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddUser();
    });

    $("#modal").modal("show");
});

function rebuildUsersByOrgID(orgID, userData) {
    let userList = $(`#org-${orgID}`).find('.user-list');

    // Check if the existing user item's ID is in the array of user data, if not remove it
    userList.children().filter(function() {
        const childId = $(this).attr('id');
        const hasId = userData.some(function(obj) {
            return `user-${obj.id}` == childId;
        });
        return !hasId;
      }).remove();

    // Check whether user item exists, if it does update it, if not create new one
    userData.forEach((user, idx) => {
        let userItem = $(`#user-${user.id}`);
        if (userItem.length)
            userItem.find(".user-name").text(user.name);
        else {
            userItem = $(userTemplate(user.id, user.name, orgID));
            userList.append(userItem);
        }
        userItem.css('order', idx);
    });
}

function rebuildOrgs(orgData) {
    let orgsContainer = $("#orgs-container");

    // Check if the existing org card's ID is in the array of org data, if not remove it
    orgsContainer.children().filter(function() {
        const childId = $(this).attr('id');
        const hasId = orgData.some(function(obj) {
            return `org-${obj.id}` == childId;
        });
        return !hasId;
      }).remove();

    // Check whether org card exists, if it does update it, if not create new one
    orgData.forEach((org, idx) => {
        let orgCard = $(`#org-${org.id}`);
        if (orgCard.length)
            orgCard.find(".org-name").text(org.name);
        else {
            orgCard = $(orgTemplate(org.id, org.name));
            orgsContainer.append(orgCard);
        }

        orgCard.css('order', idx);
    });
}

function fetchUsersByOrgID(orgID) {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/" + orgID + "/users/"
    }).done(function (data) {
        rebuildUsersByOrgID(orgID, data);
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
        rebuildOrgs(data);
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
