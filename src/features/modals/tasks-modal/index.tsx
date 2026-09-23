import Icon from "@/components/icon";
import { ICON_NAMES } from "@/consts/iconNames";
import { Flex, Modal, ModalContent, Image, IconButton, Text, Skeleton } from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { IDefaultModalProps, ITasksModalProps } from "../types";
import { Task as ITask, TaskData, TaskType } from "@/types";
import { useAccount } from "wagmi";
import { MOCKED_TASKS, TELEGRAM_FOLLOW_LINK, TWITTER_FOLLOW_URL } from "@/consts";
import { completeTask, getTasks } from "@/api/points/queries";
import { scrollToElement } from "@/utils";
import { ModalEnum } from "@/store/modal/types";
import { useStore } from "@/hooks/useStoreContext";
import Task from "@/components/task";

const TasksModal: FC<ITasksModalProps> = ({
  isOpen,
  onClose,
  loadingTask,
  isSuccessTask,
  setLoadingTask,
  setIsSuccessTask
}) => {
  const { isConnected, address } = useAccount();
  const { openModal } = useStore("modalStore");
  const { pools, isFetched: isFetchedPools } = useStore("poolsStore");
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [hasTasksData, setHasTasksData] = useState(false);
  const [isTwitterChecked, setIsTwitterChecked] = useState(false);
  const [isTelegramChecked, setIsTelegramChecked] = useState(false);
  const [isMadeDeposit, setIsMadeDeposit] = useState(false);
  const [_loadingTask, _setLoadingTask] = useState<TaskData>(loadingTask);
  const [_isSuccessTask, _setIsSuccessTask] = useState<TaskData>(isSuccessTask);

  const fraxPool = pools.find(pool => pool.token === "FRAX");

  useEffect(() => {
    if (!isConnected) {
      setTasks(MOCKED_TASKS);
      setHasTasksData(true);
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      setTasks([]);
      setHasTasksData(false);
    };
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      const fetchTasks = async () => {
        setIsTasksLoading(true);
        const tasks = await getTasks(address).finally(() => setIsTasksLoading(false));
        const filteredTasks = tasks.filter(
          item => item.name !== "Deposit & freeze any FRAX amount"
        );
        setTasks(
          filteredTasks.map(item => ({
            ...item,
            type: getTaskTypeByName(item.name),
            // limited: item.name === "Deposit & freeze any FRAX amount" ? true : false
            limited: false
          }))
        );
        setHasTasksData(true);
      };
      fetchTasks();
    }
  }, [
    address,
    isConnected,
    _isSuccessTask.twitter,
    _isSuccessTask.telegram,
    _isSuccessTask.wallet,
    _isSuccessTask.deposit,
    _isSuccessTask.freeze
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      isSuccessTask.twitter ||
      isSuccessTask.telegram ||
      isSuccessTask.wallet ||
      isSuccessTask.deposit ||
      isSuccessTask.freeze ||
      isSuccessTask.frax
    ) {
      timer = setTimeout(() => {
        setIsSuccessTask({
          twitter: false,
          telegram: false,
          wallet: false,
          deposit: false,
          freeze: false,
          frax: false
        });
        _setIsSuccessTask({
          twitter: false,
          telegram: false,
          wallet: false,
          deposit: false,
          freeze: false,
          frax: false
        });
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [
    _isSuccessTask.twitter,
    _isSuccessTask.telegram,
    _isSuccessTask.wallet,
    _isSuccessTask.deposit,
    _isSuccessTask.freeze,
    _isSuccessTask.frax
  ]);

  const getTaskTypeByName = (name: string) => {
    if (name === "Follow us on Twitter") return "twitter";
    if (name === "Join us on Telegram") return "telegram";
    if (name === "Make a deposit") return "deposit";
    if (name === "Freeze deposit to farm points") return "freeze";
    if (name === "Deposit & freeze any FRAX amount") return "frax";
    return "wallet";
  };

  const getPointsOfTask = (type: TaskType) => {
    if (type === "wallet") return 30;
    if (type === "deposit") return 50;
    if (type === "freeze") return 100;
    if (type === "frax") return 500;
    return 10;
  };

  const onCompleteTask = (index: number) => {
    if (address) {
      const task = tasks[index];

      setLoadingTask(prev => ({ ...prev, [task.type]: true }));
      _setLoadingTask(prev => ({ ...prev, [task.type]: true }));

      completeTask(address, task.name).finally(() => {
        setLoadingTask(prev => ({ ...prev, [task.type]: false }));
        _setLoadingTask(prev => ({ ...prev, [task.type]: false }));
        setIsSuccessTask(prev => ({ ...prev, [task.type]: true }));
        _setIsSuccessTask(prev => ({ ...prev, [task.type]: true }));
      });
    }
  };

  const connectBtn = {
    title: "Connect",
    loading: false,
    onClick: () => {
      // @ts-ignore
      openModal({ type: ModalEnum.ConnectWallet });
    }
  };

  const getButtonProps = (
    type: TaskType,
    index: number
  ): { title: string; loading: boolean; onClick: VoidFunction } | undefined => {
    if (type === "wallet")
      return isConnected
        ? { title: "Claim", loading: _loadingTask.wallet, onClick: () => onCompleteTask(index) }
        : connectBtn;
    if (type === "telegram")
      return !isConnected
        ? connectBtn
        : isTelegramChecked
        ? { title: "Claim", loading: _loadingTask.telegram, onClick: () => onCompleteTask(index) }
        : {
            title: "Join",
            loading: false,
            onClick: () => {
              window.open(TELEGRAM_FOLLOW_LINK, "_blank");
              setIsTelegramChecked(true);
            }
          };
    if (type === "deposit")
      return !isConnected
        ? connectBtn
        : isMadeDeposit
        ? { title: "Claim", loading: _loadingTask.deposit, onClick: () => onCompleteTask(index) }
        : {
            title: "Deposit",
            loading: false,
            onClick: () => {
              // setIsOpenTooltip(false);
              onClose();
              scrollToElement("pools");
            }
          };
    if (type === "freeze")
      return !isConnected
        ? connectBtn
        : isMadeDeposit
        ? { title: "Claim", loading: _loadingTask.freeze, onClick: () => onCompleteTask(index) }
        : {
            title: "Deposit",
            loading: false,
            onClick: () => {
              // setIsOpenTooltip(false);
              onClose();
              scrollToElement("pools");
            }
          };
    if (type === "frax") {
      return !isConnected
        ? connectBtn
        : {
            title: "Deposit",
            loading: !isFetchedPools,
            onClick: () => {
              openModal({
                type: ModalEnum.Deposit,
                props: { pool: fraxPool, type: ModalEnum.Deposit }
              });
            }
          };
    }
    return !isConnected
      ? connectBtn
      : isTwitterChecked
      ? { title: "Claim", loading: _loadingTask.twitter, onClick: () => onCompleteTask(index) }
      : {
          title: "Follow",
          loading: false,
          onClick: () => {
            window.open(TWITTER_FOLLOW_URL, "_blank");
            setIsTwitterChecked(true);
          }
        };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        width="100%"
        border="none"
        borderTopLeftRadius="8px"
        borderTopRightRadius="8px"
        pos="absolute"
        bottom={0}
        m={0}
        minW="100%"
      >
        <Flex
          flexDir="column"
          gap="24px"
          padding="12px"
          bg="bg2"
          borderTopLeftRadius="8px"
          borderTopRightRadius="8px"
          position="relative"
        >
          <Image src="/assets/image/TasksPoints.png" />
          <IconButton
            aria-label="close"
            icon={<Icon name={ICON_NAMES.close} />}
            onClick={onClose}
            pos="absolute"
            top={5}
            right={5}
            bg="bg2"
            boxSize="32px"
            padding="4px"
            borderRadius="2px"
            minW={0}
          />
          <Flex flexDir="column" gap="12px">
            <Text fontSize="22px" fontWeight={500}>
              Invictus Incentives Campaign
            </Text>
            <Text textStyle="text14" color="ink3">
              Don't miss the chance to earn Invictus points as the community incentivization
              program approaches!
            </Text>
          </Flex>
          <Flex flexDir="column" gap="16px" padding="12px" bg="bg3" borderRadius="2px">
            <Flex justify="space-between" alignItems="center">
              <Text textStyle="text16" color="ink" fontWeight={500}>
                Tasks
              </Text>
              {!isTasksLoading && (
                <Text fontSize="12px" color="ink3">
                  Completed {tasks.filter(task => task.complete).length} of {tasks.length}
                </Text>
              )}
            </Flex>
            {!hasTasksData ? (
              Array.from({ length: 5 })
                .fill(0)
                .map((_, index) => (
                  <Flex flexDir="column" gap="16px">
                    <Skeleton height="24px" width="100%" />
                  </Flex>
                ))
            ) : (
              <Flex flexDir="column" gap="16px">
                {tasks.map((task, index) => (
                  <Task
                    {...task}
                    pointsQty={getPointsOfTask(task.type)}
                    ButtonProps={getButtonProps(task.type, index)}
                  />
                ))}
              </Flex>
            )}
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default TasksModal;
