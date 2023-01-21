const urlBase = "/pritunl/api/";
const orgTemplate = (id, name) =>
    `<div id=org-${id} class='card my-3 org-wrapper'>
        <div class='card-header org-header'>
            <input class="form-check-input org-check" type="checkbox" name="del-check" value="${id}" aria-label="Select checkbox">
            <span class="org-name">${name}</span>
        </div>
        <ul class='list-group list-group-flush user-list'>
    </div>`;
const userTemplate = (id, name, org_id) => 
    `<li id="user-${id}" class="list-group-item user-item">
        <input class="form-check-input user-check" type="checkbox" name="del-check" value="${id},${org_id}" aria-label="Select checkbox">
        <span class="user-name">${name}</span>
    </li>`;
let orgData = [];
let userData = {};


$("#btn-del-select").on("click", function () {
    let orgs = $(".org-check:checked");
    let users = $(".user-check:checked:not(:disabled)");

    let itemList = $("<ul></ul>");
    if (orgs.length) {
        orgs.each(function(){
            itemList.append($("<li>" + $(this).siblings(".org-name").text() + "</li>"));
        });
    }
    if (users.length) {
        users.each(function(){
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

    $("#modal-btn-del").off().on("click", function() {
        
    });

    $("#modal").modal("show");
});

function sortOrgs() {
    let orgs = $("#org-container .org-wrapper").get();
    if (!orgs.length) {
        console.error("Failed to sort, no organizations found.");
        return;
    }

    orgs.sort(function (org1, org2) {
        return $(org1).children(".org-header").text().trim().localeCompare($(org2).children(".org-header").text().trim())
    })

    $("#org-container").append(orgs);
}

function sortUserList(orgID) {
    let users = $(`#org-${orgID} .user-item`).get();
    if (!users.length) {
        console.error(`Failed to sort, no users found under organization with ID (${orgID}).`);
        return;
    }

    users.sort(function (user1, user2) {
        return $(user1).text().trim().localeCompare($(user2).text().trim())
    })

    $(`#org-${orgID} .user-list`).append(users);
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
        $.when(reloadOrgs()).then(function () {
            $("#org-container").append($(orgTemplate(response.id, response.name)));
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
        <button type="submit" form="form" class="btn btn-primary">Submit</button>`
    )

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddOrg();
    });

    $("#modal").modal("show");
});

function submitAddUser() {
    let formData = $("form").serializeArray();
    let orgID;
    let user = {};

    formData.forEach(function (item, idx, object) {
        if (item.value.trim().length === 0)
            object.splice(idx, 1);
        else
            user[item.name] = item.value;
    });
    orgID = user.organization;
    delete user.organization;

    $.ajax({
        method: "POST",
        url: urlBase + "organizations/" + orgID + "/users/create/",
        data: user
    }).done(function (response) {
        $("#modal").modal("hide");
        $.when(reloadUsersByOrgID(orgID)).then(function () {
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
        <button type="submit" form="form" class="btn btn-primary">Submit</button>`
    )

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddUser();
    });

    $("#modal").modal("show");
});

// function rebuildOrgByID(orgID) {
//     let orgInfo = orgData.filter(obj => obj.id == orgID);
//     if (!orgInfo.length) {
//         console.error("There is no organization with given ID, failed to rebuild!");
//         return;
//     }
//     let orgHeader = $("#org-" + orgID + " .card-header");
//     if (orgHeader.length)
//         orgHeader.text(orgInfo[0].name);
//     else {

//     }
// }

// function rebuildUserListByOrgID(orgID) {
//     let userList = $("#org-" + orgID + " ul");
//     userList.empty();
//     if (orgID in userData) {
//         userData[orgID].forEach(user => {
//             userList.append($("<li class='list-group-item'>" + user.name + "</li>"));
//         });
//     }
// }

function rebuildOrgContainer() {
    let orgContainer = $("#org-container");
    orgContainer.empty();

    orgData.forEach(org => {
        let card = $(orgTemplate(org.id, org.name));
        orgContainer.append(card);

        if (org.id in userData) {
            let userList = card.children(".user-list");
            userData[org.id].forEach(user => {
                userList.append($(userTemplate(user.id, user.name, user.organization)));
            });
        }
    });
}

function reloadUsersByOrgID(orgID) {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/" + orgID + "/users/"
    }).done(function (data) {
        if (data.length == 0)
            delete userData[orgID];
        else
            userData[orgID] = data;
    });
}

function reloadAllUsers() {
    ajaxCalls = [];
    orgData.forEach(org => {
        ajaxCalls.push(reloadUsersByOrgID(org.id));
    });
    return ajaxCalls;
}

function reloadOrgs() {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/"
    }).done(function (data) {
        orgData = data;
    });
}

function reloadAllData() {
    $.when(reloadOrgs()).then(function () {
        userData = {};
        $.when.apply($, reloadAllUsers()).then(function () {
            rebuildOrgContainer()
        });
    })
}

$(document).on("change", ".org-check", function() {
    $(this).parent().siblings(".user-list").find(".user-check").prop({
        "disabled": $(this).is(":checked"),
        "checked": $(this).is(":checked")
    });
});

$(document).on("change", "input[name='del-check']", function() {
    $("#btn-del-select").prop('disabled', !$("input[name='del-check']:checked").length);
});

$(function() {
    reloadAllData();
});
