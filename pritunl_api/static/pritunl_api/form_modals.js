function showAddUserModal(orgData) {
    let $orgSelect = $(
        `<select id='form-input-org' name='organization' class='form-select' required>
            <option value="" selected disabled>Select an organization</option>
        </select>`
    );

    $.each(orgData, function(key, val) {
        $('<option>').val(val.id).text(val.name).appendTo($orgSelect);
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
                ${$orgSelect.prop("outerHTML")}
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
        <button type="submit" form="form" id="form-submit-btn" class="btn btn-primary" disabled>Add</button>`
    )

    $("#form-input-org").off().on('change', function() {
        if ($(this).val() === '')
            $("#form-submit-btn").prop('disabled', true);
        else
            $("#form-submit-btn").prop('disabled', false);
    });

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddUser();
    });

    $("#modal").modal("show");
}

function showAddOrgModal() {
    $("#modal-header").text("Add Organization");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-name" class="form-label">Name</label>
                <input type="text" value="" class="form-control" id="form-input-name" name="name" required>
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" id="form-submit-btn" class="btn btn-primary" disabled>Add</button>`
    )

    $("#form-input-name").off().on('input', function() {
        if ($(this).val() === '')
            $("#form-submit-btn").prop('disabled', true);
        else
            $("#form-submit-btn").prop('disabled', false);
    });

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddOrg();
    });

    $("#modal").modal("show");
}

function showDeleteUsersOrgsModal() {
    let orgs = $(".org-check:checked");
    let users = $(".user-check:checked:not(:disabled)");

    let $itemList = $("<ul>");
    orgs.each((_, elm) => $("<li>").text($(elm).siblings(".org-name").text()).appendTo($itemList));
    users.each((_, elm) => $("<li>").text($(elm).siblings(".user-name").text()).appendTo($itemList));

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

function showAddServerModal() {
    $("#modal-header").text("Add Server");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="form-input-name" name="name" required>
            </div>
            <div class="mb-3">
                <label for="form-input-network" class="form-label">Virtual Network</label>
                <input type="text" class="form-control" id="form-input-network" name="network" required>
            </div>
            <div class="mb-3">
                <div class="row g-3">
                    <div class="col-8">
                        <label for="form-input-port" class="form-label">Port</label>
                        <input type="number" min="1" max="65535" class="form-control" id="form-input-port" name="port" required>
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

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddServer();
    });

    $("#modal").modal("show");
}

function showAddRouteModal(serverData) {
    let serverSelect = $(
        `<select id='form-input-server' name='server' class='form-select' required>
            <option value="" selected disabled>Select server</option>
        </select>`
    );

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
                <label for="form-input-server" class="form-label">Server</label>
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

    let $serverSelect = $(
        `<select id='form-input-server' name='server' class='form-select' required>
            <option value="" selected disabled>Select server</option>
        </select>`
    );

    $.each(serverData, function (key, val) {
        $('<option>').val(val.id).text(val.name).appendTo($serverSelect);
    });

    let $orgSelect = $(
        `<select id='form-input-org' name='organization' class='form-select' required>
            <option value="" selected disabled>Select organization</option>
        </select>`
    );

    $.each(orgData, function(key, val) {
        $('<option>').val(val.id).text(val.name).appendTo($orgSelect);
    });

    $("#modal-header").text("Attach Organization");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-server" class="form-label">Server</label>
                ${$serverSelect.prop("outerHTML")}
            </div>
            <div class="mb-3">
                <label for="form-input-org" class="form-label">Organization</label>
                ${$orgSelect.prop("outerHTML")}
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
            itemList.append($("<li>" + $(this).siblings(".server-name").text() + "</li>"));
        });
    }
    if (routes.length) {
        routes.each(function(){
            itemList.append($("<li>" + $(this).siblings(".route-network").text() + "</li>"));
        });
    }
    if (orgs.length) {
        orgs.each(function(){
            itemList.append($("<li>" + $(this).siblings(".org-name").text() + "</li>"));
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
        $.when.apply($, deleteAllSelected(servers, routes, orgs)).then(function() {
            $("#modal").modal("hide");
        });
    });

    $("#modal").modal("show");
}