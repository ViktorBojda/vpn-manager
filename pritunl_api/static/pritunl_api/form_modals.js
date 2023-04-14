function checkIfEmpty(inputs) {
    // Checks if atleast one of the provided inputs is empty, if it is then disable submit button
    $('#form-submit-btn').prop('disabled', inputs.toArray().some(input => input.value.trim() === ''));
}

function showBulkAddUsersModal(orgData) {
    if (!Array.isArray(orgData) || !orgData.length) {
        alert("error: orgData variable must be non empty array containing data about organizations");
        return;
    }
    let $orgSelect = $(`<select id='form-input-org' name='organization' class='form-select' required></select>`);
        $.each(orgData, function(key, val) {
            $('<option>').val(val.id).text(val.name).appendTo($orgSelect);
        });

    $("#modal-header").text("Bulk Add Users");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-name" class="form-label">
                    Enter list of usernames and optionally an email addresses on each line 
                    with a comma separating the username from the email address
                </label>
                <textarea class="w-100" style="min-width: 40ch; resize: none;" name="user_list" id="form-input-user-list" rows="10" required></textarea>
            </div>
            <div class="mb-3">
                <label for="form-input-org" class="form-label">Select an organization</label>
                ${$orgSelect.prop('outerHTML')}
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" id="form-submit-btn" class="btn btn-primary">Add</button>`
    )

    $("#form").off('input').on('input', () => checkIfEmpty($('#form [required]')));
    $("#form").trigger('input');

    $("#form").off('submit').on("submit", function (event) {
        event.preventDefault();
        submitBulkAddUsers();
    });

    $("#modal").modal("show");
}

function showAddEditUserModal(action, data) {
    const actions = ['add', 'edit'];
    if (!actions.includes(action)) {
        console.error('Invalid action provided: ' + action);
        return;
    }
    let $orgDiv, hiddenInputs;

    if (action === 'add') {
        if (!Array.isArray(data) || !data.length) {
            alert("error: when action is 'add', data variable must be non empty array containing data about organizations");
            return;
        }
        let $orgSelect = $(`<select id='form-input-org' name='organization' class='form-select' required></select>`);
        $.each(data, function(key, val) {
            $('<option>').val(val.id).text(val.name).appendTo($orgSelect);
        });
        $orgDiv = $(
            `<div class="mb-3">
                <label for="form-input-org" class="form-label">Select an organization</label>
                ${$orgSelect.prop("outerHTML")}
            </div>`
        );
    }

    if (action === 'edit') {
        if (typeof data !== 'object' || Array.isArray(data)) {
            alert("error: when action is 'edit', data variable must be object containing user's data in key value pairs");
            return;
        }
        $.each(data, (key, value) => {
            if (value == null)
                data[key] = '';
        });
        hiddenInputs = $(
            `<div>
                <input type='hidden' name='organization' value=${data.organization}></input>
                <input type='hidden' name='id' value=${data.id}></input>
            </div>`
        );
    }

    $("#modal-header").text(`${(action === 'edit') ? 'Edit User' : 'Add User'}`);
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-name" class="form-label">Name</label>
                <input type="text" value="${(action === 'edit') ? data.name : ''}" class="form-control" id="form-input-name" name="name" required>
            </div>
            ${(action === 'edit') ? hiddenInputs.prop('outerHTML') : $orgDiv.prop('outerHTML')}
            <div class="mb-3">
                <label for="form-input-group" class="form-label">Groups</label>
                <input type="text" value="${(action === 'edit') ? data.groups : ''}" class="form-control" id="form-input-group" name="groups">
            </div>
            <div class="mb-3">
                <label for="form-input-email" class="form-label">Email address</label>
                <input type="email" value="${(action === 'edit') ? data.email : ''}" class="form-control" id="form-input-email" name="email">
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" id="form-submit-btn" class="btn btn-primary">${(action === 'edit') ? "Edit" : "Add"}</button>`
    )

    $("#form").off('input').on('input', () => checkIfEmpty($('#form [required]')));
    $("#form").trigger('input');

    $("#form").off('submit').on("submit", function (event) {
        event.preventDefault();
        action === 'add' ? submitAddUser() : submitEditUser();
    });

    $("#modal").modal("show");
}

function showAddEditOrgModal(action, data = null) {
    const actions = ['add', 'edit'];
    if (!actions.includes(action)) {
        console.error('Invalid action provided: ' + action);
        return;
    }

    let hiddenOrgID;
    if (action === 'edit') {
        if (typeof data !== 'object' || Array.isArray(data)) {
            alert("error: when action is 'edit', data variable must be object containing organization's data in key value pairs");
            return;
        }
        hiddenOrgID = $(`<input type='hidden' name='id' value=${data.id}></input>`);
    }

    $("#modal-header").text(`${(action === 'edit') ? "Edit Organization" : "Add Organization"}`);
    $("#modal-body").html(
        `<form id="form">
            ${(action === 'edit') ? hiddenOrgID.prop('outerHTML') : ''}
            <div class="mb-3">
                <label for="form-input-name" class="form-label">Name</label>
                <input type="text" value="${(action === 'edit') ? data.name : ''}" class="form-control" id="form-input-name" name="name" required>
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" id="form-submit-btn" class="btn btn-primary">${(action === 'edit') ? "Edit" : "Add"}</button>`
    )

    $("#form").off('input').on('input', () => checkIfEmpty($('#form [required]')));
    $("#form").trigger('input');

    $("#form").off('submit').on("submit", function (ev) {
        ev.preventDefault();
        action === 'add' ? submitAddOrg() : submitEditOrg();
    });

    $("#modal").modal("show");
}

function showDeleteUsersOrgsModal() {
    let orgs = $(".org-check:checked");
    let users = $(".user-check:checked:not(:disabled)");

    let $itemList = $("<ul>");
    orgs.each((_, elm) => $("<li>").text($(elm).siblings(".org-data-name").text()).appendTo($itemList));
    users.each((_, elm) => $("<li>").text($(elm).siblings(".user-data-name").text()).appendTo($itemList));

    $("#modal-header").text("Delete Selected");
    $("#modal-body").html(
        `<h2 class="fs-6">Are you sure you want to delete the following items?</h2>
        ${$itemList.prop("outerHTML")}`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" id="modal-btn-del"class="btn btn-danger">Delete</button>`
    )

    $("#modal-btn-del").off().on("click", function () {
        $.when.apply($, deleteAllSelected(orgs, users)).then(function () {
            $("#modal").modal("hide");
        });
    });

    $("#modal").modal("show");
}

function showAddEditServerModal(action, data = null) {
    const actions = ['add', 'edit'];
    if (!actions.includes(action)) {
        console.error('Invalid action provided: ' + action);
        return;
    }
    let hiddenServerID;
    if (action === 'edit') {
        if (typeof data !== 'object' || Array.isArray(data)) {
            alert("error: when action is 'edit', data variable must be object containing server's data in key value pairs");
            return;
        }
        hiddenServerID = $(`<input type='hidden' name='id' value=${data.id}></input>`);
    }

    $("#modal-header").text(`${(action === 'edit') ? 'Edit Server' : 'Add Server'}`);
    $("#modal-body").html(
        `<form id="form">
            ${(action === 'edit') ? hiddenServerID.prop('outerHTML') : ''}
            <div class="mb-3">
                <label for="form-input-name" class="form-label">Name</label>
                <input type="text" value="${(action === 'edit') ? data.name : ''}" class="form-control" id="form-input-name" name="name" required>
            </div>
            <div class="mb-3">
                <label for="form-input-network" class="form-label">Virtual Network</label>
                <input type="text" value="${(action === 'edit') ? data.network : ''}" class="form-control" id="form-input-network" name="network" required>
            </div>
            <div class="mb-3">
                <div class="row g-3">
                    <div class="col-8">
                        <label for="form-input-port" class="form-label">Port</label>
                        <input type="number" value="${(action === 'edit') ? data.port : ''}" min="1" max="65535" class="form-control" id="form-input-port" name="port" required>
                    </div>
                    <div class="col-4">
                        <label for="form-input-protocol" class="form-label">Protocol</label>
                        <select id='form-input-protocol' name='protocol' class='form-select' required>
                            <option value="tcp" selected>TCP</option>
                            <option value="udp">UDP</option>
                        </select>
                    </div>
                </div>  
            </div>
            <div class="mb-3">
                <div class="row g-3">
                    <div class="col">
                        <label for="form-input-cipher" class="form-label">Encryption Cipher</label>
                        <select id='form-input-cipher' name='cipher' class='form-select' required>
                            <option value="none">None</option>
                            <option value="bf128">Blowfish 128bit</option>
                            <option value="bf256">Blowfish 256bit</option>
                            <option value="aes128" selected>AES 128bit GCM</option>
                            <option value="aes192">AES 192bit GCM</option>
                            <option value="aes256">AES 256bit GCM</option>
                        </select>
                    </div>
                    <div class="col">
                        <label for="form-input-hash" class="form-label">Hash Algorithm</label>
                        <select id='form-input-hash' name='hash' class='form-select' required>
                            <option value="md5">MD5</option>
                            <option value="sha1" selected>SHA-1</option>
                            <option value="sha256">SHA-256</option>
                            <option value="sha512">SHA-512</option>
                        </select>
                    </div>
                </div>  
            </div>
            <div class="mb-3">
                <label for="form-input-network-mode" class="form-label">Network Mode</label>
                <select id='form-input-network-mode' name='network_mode' class='form-select' required>
                    <option value="tunnel" selected>Tunnel</option>
                    <option value="bridge">Bridge</option>
                </select>
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" class="btn btn-primary">Submit</button>`
    )

    if (action === 'edit') {
        'protocol' in data ? $('#form-input-protocol').val(data.protocol) : '';
        'cipher' in data ? $('#form-input-cipher').val(data.cipher) : '';
        'hash' in data ? $('#form-input-hash').val(data.hash) : '';
        'network_mode' in data ? $('#form-input-network-mode').val(data.network_mode) : '';
    }

    $("#form").off('input').on('input', () => checkIfEmpty($('#form [required]')));
    $("#form").trigger('input');

    $("#form").off('submit').on("submit", function (ev) {
        ev.preventDefault();
        action === 'add' ? submitAddServer() : submitEditServer();
    });

    $("#modal").modal("show");
}

function showAddRouteModal(serverData) {
    let serverSelect = $(`<select id='form-input-server' name='server' class='form-select' required></select>`);
    $.each(serverData, function (key, val) {
        serverSelect.append($(`<option value=${val.id}>${val.name}</option>`));
    });

    $("#modal-header").text("Add Route");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-network" class="form-label">Network</label>
                <input type="text" class="form-control" id="form-input-network" name="network" required>
            </div>
            <div class="mb-3">
                <label for="form-input-server" class="form-label">Select a server</label>
                ${serverSelect.prop("outerHTML")}
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" class="btn btn-primary">Add</button>`
    )

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddRoute();
    });

    $("#modal").modal("show");
}

function showAttachOrgModal(serverData, orgData) {
    if (!orgData.length) {
        alert("No organizations found, you must add organization before you can attach it!");
        return;
    }

    let $serverSelect = $(`<select id='form-input-server' name='server' class='form-select' required></select>`);
    $.each(serverData, function (key, val) {
        $('<option>').val(val.id).text(val.name).appendTo($serverSelect);
    });

    let $orgSelect = $(`<select id='form-input-org' name='organization' class='form-select' required></select>`);
    $.each(orgData, function(key, val) {
        $('<option>').val(val.id).text(val.name).appendTo($orgSelect);
    });

    $("#modal-header").text("Attach Organization");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-org" class="form-label">Select an organization</label>
                ${$orgSelect.prop("outerHTML")}
            </div>
            <div class="mb-3">
                <label for="form-input-server" class="form-label">Select a server</label>
                ${$serverSelect.prop("outerHTML")}
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" class="btn btn-primary">Attach</button>`
    )

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAttachOrg();
    });

    $("#modal").modal("show");
}

function showDeleteServersModal() {
    let servers = $(".server-check:checked");
    let routes = $(".route-check:checked:not(:disabled)");
    let orgs = $(".org-check:checked:not(:disabled)");

    let itemList = $("<ul></ul>");
    if (servers.length) {
        servers.each(function(){
            itemList.append($("<li>" + $(this).siblings(".server-data-name").text() + "</li>"));
        });
    }
    if (routes.length) {
        routes.each(function(){
            itemList.append($("<li>" + $(this).siblings(".route-data-network").text() + "</li>"));
        });
    }
    if (orgs.length) {
        orgs.each(function(){
            itemList.append($("<li>" + $(this).siblings(".org-data-name").text() + "</li>"));
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

    $("#modal-btn-del").off('click').on("click", function() {
        $.when.apply($, deleteAllSelected(servers, routes, orgs)).then(function() {
            $("#modal").modal("hide");
        });
    });

    $("#modal").modal("show");
}

function showUserLinksModal(data) {
    if (typeof data !== 'object' || Array.isArray(data)) {
        alert("error: data variable must be object containing user's link data in key value pairs");
        return;
    }

    $("#modal-header").text("Temporary Profile Links");
    $("#modal-body").html(
        `<div class="mb-3">
            <label for="form-input-name" class="form-label">Temporary url to download profile, expires after 24 hours</label>
            <input type="text" readonly value="${data.base_url + data.key_url}" class="form-control">
        </div>
        <div class="mb-3">
            <label for="form-input-name" class="form-label">Temporary url to download zip profile, expires after 24 hours</label>
            <input type="text" readonly value="${data.base_url + data.key_zip_url}" class="form-control">
        </div>
        <div class="mb-3">
            <label for="form-input-name" class="form-label">Temporary url to download Chromebook profile, expires after 24 hours</label>
            <input type="text" readonly value="${data.base_url + data.key_onc_url}" class="form-control">
        </div>
        <div class="mb-3">
            <label for="form-input-name" class="form-label">Temporary url to view profile links, expires after 24 hours</label>
            <input type="text" readonly value="${data.base_url + data.view_url}" class="form-control">
        </div>
        <div class="mb-3">
            <label for="form-input-name" class="form-label">Temporary uri link for Pritunl Client, expires after 24 hours</label>
            <input type="text" readonly value="pritunl${data.base_url.substring(data.base_url.indexOf(':')) + data.uri_url}" class="form-control">
        </div>`
    )
    $("#modal-footer").html(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`);

    $("#modal").modal("show");
}