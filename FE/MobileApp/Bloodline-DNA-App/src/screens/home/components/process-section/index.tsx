import React from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ProcessStep } from "../../../../types/home/home.types";
import { styles } from "./styles";

const { width } = Dimensions.get("window");

const steps: ProcessStep[] = [
  {
    icon: "calendar",
    title: "Đặt lịch",
    description: "Đăng ký trực tuyến hoặc liên hệ để đặt lịch lấy mẫu.",
  },
  {
    icon: "flask",
    title: "Lấy mẫu",
    description: "Lấy mẫu ADN đơn giản tại cơ sở hoặc tại nhà.",
  },
  {
    icon: "dna",
    title: "Phân tích",
    description: "Mẫu được phân tích trong phòng thí nghiệm hiện đại.",
  },
  {
    icon: "file-document",
    title: "Nhận kết quả",
    description: "Kết quả được gửi qua email bảo mật hoặc giao trực tiếp.",
  },
];

const ProcessSection: React.FC = () => {
  const numColumns = width > 1024 ? 4 : width > 768 ? 2 : 1;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quy trình xét nghiệm ADN huyết thống</Text>
        <FlatList
          scrollEnabled={false}
          data={steps}
          keyExtractor={(_, index) => index.toString()}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <View style={styles.stepCard}>
              <View style={styles.iconContainer}>
                <Icon
                  name={item.icon}
                  size={32}
                  color="#2563EB"
                  style={styles.icon}
                />
              </View>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDescription}>{item.description}</Text>
            </View>
          )}
          key={numColumns.toString()}
          columnWrapperStyle={
            numColumns > 1 ? styles.columnWrapper : undefined
          }
        />
      </View>
    </View>
  );
};

export default ProcessSection;