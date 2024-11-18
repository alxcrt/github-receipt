import { redirect } from "next/navigation";
import React from "react";

export default function Search() {
  return (
    <div>
      <div className="absolute top-[60%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] z-50">
        <form
          className="font-mono text-2xl flex flex-col items-center"
          action={async (data: FormData) => {
            "use server";
            redirect(`/${data.get("user")}`);
          }}
        >
          {/* <button type="submit" className="px-4 py-2 bg-black text-white ">
            Print
          </button> */}

          <div className="border-t border-b border-dashed py-3 mb-4 border-black">
            <table className="w-full">
              <tbody>
                <tr>
                  <td>
                    <input
                      type="text"
                      name="user"
                      id="user"
                      placeholder="Enter Github username"
                      required
                      className="border-0 bg-transparent text-center text-2xl text-black p-2 mr-2 outline-none"
                    />
                  </td>
                  <td>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white "
                    >
                      Print
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>
      </div>
    </div>
  );
}
