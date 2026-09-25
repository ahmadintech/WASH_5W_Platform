import AppLayout from "../../layout/AppLayout";
import UserManagement from "./UserManagement";

export default function AdminUsers() {
  return <UserManagement />;
}

AdminUsers.layout = (page: any) => <AppLayout>{page}</AppLayout>;

