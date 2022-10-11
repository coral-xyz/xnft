// Copyright (C) 2022 Blue Coral, Inc.

mod create_curator;
mod create_install;
mod create_permissioned_install;
mod create_review;
mod create_xnft;
mod delete_install;
mod delete_review;
mod grant_access;
mod revoke_access;
mod set_suspended;
mod update_xnft;
mod verify_curator;

pub use create_curator::*;
pub use create_install::*;
pub use create_permissioned_install::*;
pub use create_review::*;
pub use create_xnft::*;
pub use delete_install::*;
pub use delete_review::*;
pub use grant_access::*;
pub use revoke_access::*;
pub use set_suspended::*;
pub use update_xnft::*;
pub use verify_curator::*;
