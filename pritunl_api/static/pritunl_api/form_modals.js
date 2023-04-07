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
            fetchAllData();
            $("#modal").modal("hide");
        });
    });

    $("#modal").modal("show");
}