import path from "path";
import {emulator, init, getAccountAddress, mintFlow, getFlowBalance,
        deployContractByName, getContractAddress, sendTransaction, executeScript} from "flow-js-testing";

jest.setTimeout(100000);

async function deployAll() {
  var [deploymentResult, error] = await deployContractByName({name: "NonFungibleToken"});
  var [deploymentResult, error] = await deployContractByName({name: "MetadataViews"});
  var [deploymentResult, error] = await deployContractByName({name: "DateUtils"});
  const NonFungibleToken = await getContractAddress("NonFungibleToken");
  const MetadataViews = await getContractAddress("MetadataViews");
  const DateUtils = await getContractAddress("DateUtils");
  [deploymentResult, error] = await deployContractByName({name: "DayNFT", addressMap: {NonFungibleToken, MetadataViews, DateUtils}});
  const DayNFT = await getContractAddress("DayNFT");
  [deploymentResult, error] = await deployContractByName({name: "DaysOnFlow", addressMap: {NonFungibleToken, MetadataViews, DateUtils, DayNFT}});
}

describe("days_on_flow", ()=>{
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, ".."); 
    const port = 8081; 
    const logging = false;
    
    await init(basePath, { port });
    return emulator.start(port, logging);
  });
  
  afterEach(async () => {
    return emulator.stop();
  });

  
  test("days_on_flow", async () => {    
    await deployAll();
    
    // actors' addresses
    const alice = await getAccountAddress("Alice");
    const bob = await getAccountAddress("Bob");
    const wl_user = await getAccountAddress("wl_user");
    const myself = await getContractAddress("DaysOnFlow");
    
    // give some flow to users
    await mintFlow(alice, 50.0);
    await mintFlow(bob, 50.0);
    
    // simulate events over a few days
    const day1 = [26, 1, 2021];
    const day2 = [27, 1, 2021];
    const day3 = [28, 1, 2021];
    const day4 = [29, 1, 2021];
    
    // bid by alice
    var args = [10.0, "hello world", day1, day1];
    var [tx, error] = await sendTransaction("make_bid_test", [alice], args);
    expect(error).toBeNull();

    // claim NFTs for alice
    var [result, error] = await sendTransaction("claim_nfts_test", [alice], [day2]);
    expect(error).toBeNull();

    // bid by bob
    var args = [10.0, "hello world1", day2, day2];
    var [tx, error] = await sendTransaction("make_bid_test", [bob], args);
    expect(error).toBeNull();

    // claim NFTs for bob
    var [result, error] = await sendTransaction("claim_nfts_test", [bob], [day3]);
    expect(error).toBeNull();

    // bid by alice
    var args = [1.0, "hello world 3", day3, day3];
    var [tx, error] = await sendTransaction("make_bid_test", [alice], args);
    expect(error).toBeNull();

    // claim NFTs for alice
    var [result, error] = await sendTransaction("claim_nfts_test", [alice], [day4]);
    expect(error).toBeNull();

    // add DOF series
    var args = [false, false, "desc", "img", "name", [0, 2], [wl_user, bob], 0.5, 2, 2.5];
    var [tx, error] = await sendTransaction("add_dof_series", [myself], args);
    expect(error).toBeNull();

    // read all series and get series id
    var [result,error] = await executeScript("read_all_dof_series", []);
    let seriesId = result[0].seriesId

    // check how many daynft WL spots are due to alice
    var [result,error] = await executeScript("read_nb_dof_daynft_wl_to_claim", [seriesId, alice]);
    expect(result).toEqual(0);

    // try to claim a WL NFT (shouldn't be claimable)
    var [tx, error] = await sendTransaction("claim_dof_wl", [bob], [seriesId, 0.5]);
    expect(error).not.toBeNull();

    // make the series WL claimable
    var args = [seriesId, true, false];
    var [tx, error] = await sendTransaction("set_dof_series_claimable", [myself], args);
    expect(error).toBeNull();

    // check how many daynft WL spots are due to alice
    var [result,error] = await executeScript("read_nb_dof_daynft_wl_to_claim", [seriesId, alice]);
    expect(result).toEqual(2);
    
    // claim DOF for alice
    var [tx, error] = await sendTransaction("claim_dof_daynft_wl", [alice], [seriesId]);
    expect(error).toBeNull();

    // read alice's NFT ids
    var [result,error] = await executeScript("read_dof_collection_ids", [alice]);
    expect(new Set(result)).toEqual(new Set([0, 1]));

    // check how many daynft WL spots are due to alice
    var [result,error] = await executeScript("read_nb_dof_daynft_wl_to_claim", [seriesId, alice]);
    expect(result).toEqual(0);

    // check how many daynft WL spots are due to bob
    var [result,error] = await executeScript("read_nb_dof_daynft_wl_to_claim", [seriesId, bob]);
    expect(result).toEqual(0);

    // check how many daynft WL spots are due to wl_user
    var [result,error] = await executeScript("read_nb_dof_daynft_wl_to_claim", [seriesId, wl_user]);
    expect(result).toEqual(0);

    // check if a WL spot is due to wl_user
    var [result,error] = await executeScript("read_has_dof_wl_to_claim", [seriesId, wl_user]);
    expect(result).toEqual(true);

    // check if a WL spot is due to alice
    var [result,error] = await executeScript("read_has_dof_wl_to_claim", [seriesId, alice]);
    expect(result).toEqual(false);

    // check if a WL spot is due to bob
    var [result,error] = await executeScript("read_has_dof_wl_to_claim", [seriesId, bob]);
    expect(result).toEqual(true);

    // claim DOF for bob with bad WL amount
    var [tx, error] = await sendTransaction("claim_dof_wl", [bob], [seriesId, 1.5]);
    expect(error).not.toBeNull();

    // claim DOF for bob with correct WL amount
    var [tx, error] = await sendTransaction("claim_dof_wl", [bob], [seriesId, 0.5]);
    expect(error).toBeNull();

    // read bob's NFT ids
    var [result,error] = await executeScript("read_dof_collection_ids", [bob]);
    expect(new Set(result)).toEqual(new Set([2]));

    // read bob's NFT
    var [result,error] = await executeScript("read_dof_nft", [bob, 2]);
    var exp_res = {id: 2, seriesDescription: 'desc', seriesId: seriesId, seriesImage: 'img', seriesName: 'name', serial: 2}
    exp_res["uuid"] = result["uuid"]
    expect(result).toEqual(exp_res);
    
    // claim DOF for alice (not whitelisted)
    var [tx, error] = await sendTransaction("claim_dof_wl", [alice], [seriesId, 0.5]);
    expect(error).not.toBeNull();

    // make the series publicly claimable
    var args = [seriesId, false, true];
    var [tx, error] = await sendTransaction("set_dof_series_claimable", [myself], args);
    expect(error).toBeNull();

    // claim DOF public for alice (wrong price)
    var [tx, error] = await sendTransaction("claim_dof_public", [alice], [seriesId, 0.5]);
    expect(error).not.toBeNull();

    // claim DOF public for alice (good price)
    var [tx, error] = await sendTransaction("claim_dof_public", [alice], [seriesId, 2.5]);
    expect(error).toBeNull();

    // read alice's NFT ids
    var [result,error] = await executeScript("read_dof_collection_ids", [alice]);
    expect(new Set(result)).toEqual(new Set([0, 1, 3]));

    // read nb public NFTs left to mint
    var [result,error] = await executeScript("read_nb_public_to_mint", [seriesId]);
    expect(result).toEqual(1);

    // make the series publicly unclaimable
    var args = [seriesId, false, false];
    var [tx, error] = await sendTransaction("set_dof_series_claimable", [myself], args);
    expect(error).toBeNull();

    // claim DOF public for alice (shouldn't work)
    var [tx, error] = await sendTransaction("claim_dof_public", [alice], [seriesId, 2.5]);
    expect(error).not.toBeNull();

    // add another DOF series
    var args = [true, true, "description", "img", "name2", [0, 2], [wl_user, bob], 0.5, 2, 2.5];
    var [tx, error] = await sendTransaction("add_dof_series", [myself], args);
    expect(error).toBeNull();
    
    // remove DOF series
    var args = [seriesId];
    var [tx, error] = await sendTransaction("remove_dof_series", [myself], args);
    expect(error).toBeNull();

    // claim DOF public for alice
    var [tx, error] = await sendTransaction("claim_dof_public", [alice], [seriesId, 2.5]);
    expect(error).not.toBeNull();

    // read all series
    var [result,error] = await executeScript("read_all_dof_series", []);
    expect(result.length).toEqual(1);
    expect(result[0].description).toEqual("description");

    // read alice's NFT ids from series
    var [result,error] = await executeScript("read_dof_collection_ids_series", [alice, seriesId]);
    expect(new Set(result)).toEqual(new Set([0, 1, 3]));

    // read alice's NFT ids from a non existing series
    var [result,error] = await executeScript("read_dof_collection_ids_series", [alice, 123]);
    expect(result).toEqual([]);

    // withdraw and destroy an item
    var [tx, error] = await sendTransaction("destroy_dof_item", [alice], [0]);
    expect(error).toBeNull();

    // read alice's NFT ids from series
    var [result,error] = await executeScript("read_dof_collection_ids_series", [alice, seriesId]);
    expect(new Set(result)).toEqual(new Set([1, 3]));

    // read alice's NFT ids
    var [result,error] = await executeScript("read_dof_collection_ids", [alice]);
    expect(new Set(result)).toEqual(new Set([1, 3]));

  })

})
