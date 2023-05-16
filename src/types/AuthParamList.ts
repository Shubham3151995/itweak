export type AuthParamList = {
  SocialLoginScreen: undefined;
  SplashScreen: undefined;
};

export type DrawerParamsList = {
  HomeScreen: undefined;
};
export type InnerStackParamList = {
  SettingScreen: undefined;
  VideoToturialModal: undefined;
  CategoriesSettingScreen: undefined;
};
export type ContactSteps = {
  NewContactModel: undefined;
  NewContactModelStep2: {
    gender: string;
  };
  NewCategoriesModel: undefined;
  AddPeopleInCatScreen: {
    color: string
    title: string
    id?: string
  }
  EditCategorieScreen: {
    category: object
  }
  CategoriesPeople: {
    id: string
  }
}
export type Profile = {
  ProfileModel: {
    data: object
  };
  EditProfileModel: {
    data: object
  };
}