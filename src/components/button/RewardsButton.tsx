import { getRewards } from "@/api/points/queries";
import { Reward } from "@/types";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import REWARDS_DISTRIBUTOR_ABI from "@/abi/RewardsDistributorABI.json";
import { parseBigNumber } from "@/utils/formatBigNumber";
import { ARB_DECIMALS } from "@/consts";
import { ethers } from "ethers";
import { isDesktop } from "react-device-detect";

const RewardsButton = () => {
  const [reward, setReward] = useState<Reward>({} as Reward);
  const { address } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [isSuccessClaim, setIsSuccessClaim] = useState(false);

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (address || isSuccessClaim) {
      getRewards(address as string).then(data => {
        setReward(data);
      });
    }
  }, [address, isSuccessClaim]);

  const onClaimRewards = async () => {
    if (address && reward.claimable && reward.proof) {
      try {
        setIsClaiming(true);

        const proof = reward.proof
          .split(",")
          .map(p => ethers.hexlify(ethers.toUtf8Bytes(p.trim())));

        await writeContractAsync({
          address,
          abi: REWARDS_DISTRIBUTOR_ABI,
          functionName: "claim",
          args: [address, reward.reward, parseBigNumber(reward.claimable, ARB_DECIMALS), proof]
        })
          .then(() => {
            setIsSuccessClaim(true);
            setIsClaiming(false);
          })
          .catch(error => {
            console.error("Claim rewards error: ", error);
            setIsClaiming(false);
          });
      } catch (error) {
        console.error(error);
        setIsClaiming(false);
      }
    }
  };

  if (!reward || !reward.claimable) {
    return (
      <Flex
        padding="8px 16px"
        border="1px solid"
        borderColor="black.20"
        borderRadius="100px"
        userSelect="none"
        mr={isDesktop ? 6 : 0}
        minH="40px"
      >
        <Text textStyle="text14" color="black.5">
          No ARB to claim
        </Text>
      </Flex>
    );
  }

  return (
    <Button
      bg="accent"
      padding="8px 16px"
      textStyle="text16"
      color="black.100"
      fontWeight={500}
      borderRadius="100px"
      w="max-content"
      isLoading={isClaiming}
      mr={6}
      // onClick={onClaimRewards}
    >
      Claim {reward.claimable} ARB
    </Button>
  );
};

export default RewardsButton;
