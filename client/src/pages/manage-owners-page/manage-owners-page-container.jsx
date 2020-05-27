import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import * as api from "../../utils/api";
import * as generalUtils from "../../utils/utils";
import * as Message from '../../components/custom-alert/custom-alert';
import ManageOwnersPage from "./manage-owners-page.component";
import {ManageOwnersPageCtx} from "./manage-owners-page-ctx";

const ManageOwnersPageContainer = () => {

    const {storename} = useParams();
    const [owners, setOwners] = useState([]);
    const [ownersByMe, setOwnersByMe] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingOwners, setFetchingOwners] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const infoRes = await api.viewStoreInfo(storename);
            const ownersByMeRes = await api.getOwnersAssignedByMe(storename);

            if(infoRes.data.data.result && ownersByMeRes.data.data.result){
                setOwners(infoRes.data.data.info.storeOwnersNames);
                setOwnersByMe(ownersByMeRes.data.data.owners);
            }
        }

        fetchData();
    }, [fetchingOwners])

    const handleSubmit = async () => {
        setIsLoading(true);
        await generalUtils.sleep(1000);
        setIsLoading(false);
        Message.success("Permissions changed successfully")
    }

    let providerState = {
        fetchingFlag: fetchingOwners,
        updateOwners: setFetchingOwners,
        storeName: storename,
        owners: owners,
        ownersByMe: ownersByMe,
        isLoading: isLoading,
        submit: handleSubmit
    }

    return (
        <ManageOwnersPageCtx.Provider value={providerState}>
            {console.log(owners, ownersByMe)}
            <ManageOwnersPage/>
        </ManageOwnersPageCtx.Provider>
    );

}

export default ManageOwnersPageContainer;